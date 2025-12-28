const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// 你的学号
const STUDENT_ID = '239210128';

// 开启 JSON 解析
app.use(express.json());

// 静态文件挂载到学号路径下
app.use('/' + STUDENT_ID, express.static('public'));

// 初始化数据库
const db = new sqlite3.Database('treehole.db');
db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT, time TEXT, likes INTEGER DEFAULT 0)");

// 首页
app.get('/' + STUDENT_ID, (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// 获取所有留言
app.get('/' + STUDENT_ID + '/api/messages', (req, res) => {
    db.all("SELECT * FROM messages ORDER BY id DESC", (err, rows) => {
        res.json(rows);
    });
});

// 提交新留言
app.post('/' + STUDENT_ID + '/api/messages', (req, res) => {
    const content = req.body.content;
    if (!content) return res.status(400).json({ error: "内容不能为空" });
    const time = new Date().toLocaleString();
    db.run("INSERT INTO messages (content, time) VALUES (?, ?)", [content, time], function (err) {
        // 这里要加上 likes: 0
        res.json({ id: this.lastID, content, time, likes: 0 });
    });
});

// 点赞接口
app.post('/' + STUDENT_ID + '/api/like/:id', (req, res) => {
    const id = req.params.id;
    db.run("UPDATE messages SET likes = likes + 1 WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: "点赞失败" });
        res.json({ success: true });
    });
});

// 删除留言
app.delete('/' + STUDENT_ID + '/api/messages/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM messages WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: "删除失败" });
        res.json({ success: true });
    });
});

app.listen(port, () => {
    console.log(`树洞启动: http://localhost:${port}/${STUDENT_ID}`);
});