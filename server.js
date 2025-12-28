const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// 从环境变量获取端口，否则默认 3000
const port = process.env.PORT || 3000;

// 你的学号
const STUDENT_ID = '239210128';

// 开启 JSON 解析
app.use(express.json());

// 静态文件挂载到学号路径下
app.use('/' + STUDENT_ID, express.static(path.join(__dirname, 'public')));

// 初始化数据库（使用绝对路径）
const dbPath = path.join(__dirname, 'treehole.db');
const db = new sqlite3.Database(dbPath);
db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT, time TEXT, likes INTEGER DEFAULT 0)");

// 根路径重定向到学号路径
app.get('/', (req, res) => {
    res.redirect('/' + STUDENT_ID);
});

// 首页
app.get('/' + STUDENT_ID, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 获取所有留言
app.get('/' + STUDENT_ID + '/api/messages', (req, res) => {
    db.all("SELECT * FROM messages ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: "获取失败" });
        res.json(rows);
    });
});

// 提交新留言
app.post('/' + STUDENT_ID + '/api/messages', (req, res) => {
    const content = req.body.content;
    if (!content) return res.status(400).json({ error: "内容不能为空" });
    const time = new Date().toLocaleString();
    db.run("INSERT INTO messages (content, time) VALUES (?, ?)", [content, time], function (err) {
        if (err) return res.status(500).json({ error: "提交失败" });
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

app.listen(port, () => {
    console.log(`树洞启动: http://localhost:${port}/${STUDENT_ID}`);

});
