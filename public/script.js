let msgData = [];
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const msgList = document.getElementById('msgList');
const charCount = document.getElementById('charCount');

function renderMessages() {
    msgList.innerHTML = '';
    msgData.slice().reverse().forEach(msg => {
        const li = document.createElement('li');
        li.className = 'message-card';
        const divContent = document.createElement('div');
        divContent.className = 'msg-content';
        divContent.textContent = msg.content;
        const divMeta = document.createElement('div');
        divMeta.className = 'msg-meta';
        divMeta.innerHTML = `
            <span class="time">${msg.time}</span>
            <button onclick="likeMessage(${msg.id})" class="btn-like">👍 <span id="like-${msg.id}">${msg.likes}</span></button>
            <button onclick="deleteMessage(${msg.id})" class="btn-delete">删除</button>
        `;
        li.appendChild(divContent);
        li.appendChild(divMeta);
        msgList.appendChild(li);
    });
}

msgInput.addEventListener('input', function() {
    const len = this.value.length;
    charCount.textContent = `${len}/200`;
    charCount.style.color = len >= 200 ? 'red' : '#888';
});

window.likeMessage = function(id) {
    // 确保路径是 "/239210128/api/like/${id}"
    fetch(`/239210128/api/like/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => {
        if (!res.ok) throw new Error('点赞失败');
        return res.json();
    })
    .then(data => {
        const likeSpan = document.getElementById(`like-${id}`);
        likeSpan.textContent = parseInt(likeSpan.textContent) + 1;
    })
    .catch(err => {
        console.error('点赞出错', err);
        alert('点赞失败，请稍后重试');
    });
};

window.deleteMessage = function(id) {
    if (!confirm("确定要删除这条树洞吗？")) return;
    fetch(`/239210128/api/messages/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('删除失败');
        return res.json();
      })
      .then(() => {
        loadMessages();
      })
      .catch(err => {
        console.error('删除失败', err);
        alert('删除失败，请稍后重试');
      });
};

function loadMessages() {
    fetch('/239210128/api/messages')
        .then(res => {
            if (!res.ok) throw new Error('加载留言失败');
            return res.json();
        })
        .then(data => {
            msgData = data;
            renderMessages();
        })
        .catch(err => {
            console.error('加载留言出错', err);
            alert('加载留言失败，请刷新页面试试~');
        });
}

sendBtn.onclick = () => {
    const content = msgInput.value.trim();
    if (!content) {
        alert('请输入内容后再发送哦~');
        return;
    }
    sendBtn.disabled = true;
    fetch('/239210128/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    })
    .then(res => {
        if (!res.ok) throw new Error('发送失败');
        return res.json();
    })
    .then(newMsg => {
        msgInput.value = '';
        charCount.textContent = '0/200';
        loadMessages();
    })
    .catch(err => {
        console.error('发送留言出错', err);
        alert('发送失败，请稍后重试~');
    })
    .finally(() => {
        sendBtn.disabled = false;
    });
};

loadMessages();

