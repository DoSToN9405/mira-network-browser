function getOrCreateGuestUser() {
  let guestId = localStorage.getItem('guest_user_id');
  let guestName = localStorage.getItem('guest_user_name') || 'Гость';

  if (!guestId) {
    guestId = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('guest_user_id', guestId);
    localStorage.setItem('guest_user_name', guestName);
  }

  return {
    id: guestId,
    first_name: guestName,
    username: 'guest'
  };
}

const user = getOrCreateGuestUser();

document.getElementById('userName').textContent = user.first_name;
document.getElementById('userId').textContent = `ID: ${user.id}`;

const avatar = document.getElementById('userAvatar');
if (user.first_name) {
  avatar.textContent = user.first_name.charAt(0).toUpperCase();
}

let balance = parseInt(localStorage.getItem(`balance_${user.id}`) || '0', 10);
const balanceElem = document.getElementById('balance');

function updateBalance() {
  balanceElem.textContent = balance;
  localStorage.setItem(`balance_${user.id}`, balance);
}
updateBalance();

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 5px;">
      ${type === 'success' ? '✅ Успешно!' : '❌ Ошибка!'}
    </div>
    <div>${message}</div>
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 100);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

const watchAdBtn = document.getElementById('watchAd');
watchAdBtn.addEventListener('click', () => {
  if (typeof show_9657195 !== 'function') {
    showNotification('Реклама недоступна. Попробуйте позже.', 'error');
    return;
  }

  watchAdBtn.disabled = true;
  watchAdBtn.textContent = '⏳ Загрузка...';

  show_9657195()
    .then(() => {
      balance += 10;
      updateBalance();
      showNotification('Вы заработали 10 MIRA за просмотр рекламы!');
      balanceElem.style.transform = 'scale(1.2)';
      balanceElem.style.color = '#4caf50';
      setTimeout(() => {
        balanceElem.style.transform = 'scale(1)';
        balanceElem.style.color = 'white';
      }, 500);
    })
    .catch(() => {
      showNotification('Не удалось показать рекламу.', 'error');
    })
    .finally(() => {
      watchAdBtn.disabled = false;
      watchAdBtn.textContent = '🎬 Смотреть рекламу (+10 MIRA)';
    });
});

const copyBtn = document.getElementById('copyLink');
copyBtn.addEventListener('click', () => {
  const refLink = `${window.location.origin}?ref=${user.id}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(refLink)
      .then(() => {
        showNotification('Ссылка скопирована!');
        copyBtn.textContent = '✅ Скопировано!';
        setTimeout(() => copyBtn.textContent = '🔗 Пригласить друзей', 2000);
      })
      .catch(() => {
        showNotification('Не удалось скопировать', 'error');
      });
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = refLink;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showNotification('Ссылка скопирована!');
      copyBtn.textContent = '✅ Скопировано!';
      setTimeout(() => copyBtn.textContent = '🔗 Пригласить друзей', 2000);
    } catch (err) {
      showNotification('Не удалось скопировать', 'error');
    }
    document.body.removeChild(textArea);
  }
});

const withdrawBtn = document.getElementById('withdraw');
const withdrawAmount = document.getElementById('withdrawAmount');
const withdrawAddress = document.getElementById('withdrawAddress');

withdrawBtn.addEventListener('click', () => {
  const amount = parseInt(withdrawAmount.value);
  const address = withdrawAddress.value.trim();

  if (!amount || amount < 10) {
    showNotification('Минимум 10 MIRA для вывода', 'error');
    return;
  }
  if (!address) {
    showNotification('Введите адрес кошелька', 'error');
    return;
  }
  if (amount > balance) {
    showNotification('Недостаточно средств', 'error');
    return;
  }

  withdrawBtn.disabled = true;
  withdrawBtn.textContent = '⏳ Отправка...';

  const requestData = {
    userId: user.id,
    userName: user.first_name,
    amount,
    address
  };

  fetch('/api/withdraw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        balance -= amount;
        updateBalance();
        showNotification(`Заявка на ${amount} MIRA отправлена!`);
        withdrawAmount.value = '';
        withdrawAddress.value = '';
      } else {
        showNotification(data.error || 'Ошибка сервера', 'error');
      }
    })
    .catch(() => {
      showNotification('Ошибка подключения к серверу', 'error');
    })
    .finally(() => {
      withdrawBtn.disabled = false;
      withdrawBtn.textContent = 'Отправить заявку на вывод';
    });
});

const title = document.querySelector('.header h1');
const originalText = title.textContent;
title.textContent = '';
let i = 0;
function typeWriter() {
  if (i < originalText.length) {
    title.textContent += originalText.charAt(i);
    i++;
    setTimeout(typeWriter, 100);
  }
}
setTimeout(typeWriter, 500);
