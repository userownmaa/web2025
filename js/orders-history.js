const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api';
const API_KEY = 'e2e08702-1fe5-4144-b1bf-e79eede2582e';

let orders = [];
let currentOrder = null;

document.addEventListener('DOMContentLoaded', async function() {
    await loadDishes();
    await loadOrders();
});

async function loadOrders() {
    const container = document.getElementById('orders-container');
    
    try {
        const response = await fetch(`${API_URL}/orders?api_key=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error('Ошибка при загрузке заказов');
        }
        
        orders = await response.json();
        
        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        if (orders.length === 0) {
            container.innerHTML = '<p class="empty-message">У вас пока нет заказов</p>';
            return;
        }
        
        displayOrders();
        
    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p class="error-message">Не удалось загрузить заказы. Попробуйте обновить страницу.</p>';
    }
}

function displayOrders() {
    const container = document.getElementById('orders-container');
    
    let tableHTML = `
        <table class="orders-table">
            <thead>
                <tr>
                    <th>№</th>
                    <th>Дата оформления</th>
                    <th>Состав заказа</th>
                    <th>Стоимость</th>
                    <th>Время доставки</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    orders.forEach((order, index) => {
        const orderNumber = index + 1;
        const orderDate = formatDateTime(order.created_at);
        const composition = getOrderComposition(order);
        const price = calculateOrderPrice(order);
        const deliveryTime = formatDeliveryTime(order);
        
        tableHTML += `
            <tr>
                <td class="order-number">${orderNumber}</td>
                <td>${orderDate}</td>
                <td class="order-composition">${composition}</td>
                <td class="order-price">${price}₽</td>
                <td>${deliveryTime}</td>
                <td class="order-actions">
                    <button class="action-btn view" onclick="viewOrder(${order.id})" title="Подробнее">👁</button>
                    <button class="action-btn edit" onclick="editOrder(${order.id})" title="Редактировать">✏️</button>
                    <button class="action-btn delete" onclick="deleteOrder(${order.id})" title="Удалить">🗑️</button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

function getOrderComposition(order) {
    const dishNames = [];
    
    if (order.soup_id) {
        const dish = dishes.find(d => d.id === order.soup_id);
        if (dish) dishNames.push(dish.name);
    }
    
    if (order.main_course_id) {
        const dish = dishes.find(d => d.id === order.main_course_id);
        if (dish) dishNames.push(dish.name);
    }
    
    if (order.salad_id) {
        const dish = dishes.find(d => d.id === order.salad_id);
        if (dish) dishNames.push(dish.name);
    }
    
    if (order.drink_id) {
        const dish = dishes.find(d => d.id === order.drink_id);
        if (dish) dishNames.push(dish.name);
    }
    
    if (order.dessert_id) {
        const dish = dishes.find(d => d.id === order.dessert_id);
        if (dish) dishNames.push(dish.name);
    }
    
    return dishNames.join(', ');
}

function calculateOrderPrice(order) {
    let total = 0;
    
    if (order.soup_id) {
        const dish = dishes.find(d => d.id === order.soup_id);
        if (dish) total += dish.price;
    }
    
    if (order.main_course_id) {
        const dish = dishes.find(d => d.id === order.main_course_id);
        if (dish) total += dish.price;
    }
    
    if (order.salad_id) {
        const dish = dishes.find(d => d.id === order.salad_id);
        if (dish) total += dish.price;
    }
    
    if (order.drink_id) {
        const dish = dishes.find(d => d.id === order.drink_id);
        if (dish) total += dish.price;
    }
    
    if (order.dessert_id) {
        const dish = dishes.find(d => d.id === order.dessert_id);
        if (dish) total += dish.price;
    }
    
    return total;
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function formatDeliveryTime(order) {
    if (order.delivery_type === 'by_time') {
        return order.delivery_time;
    }
    return 'Как можно скорее';
}

function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    currentOrder = order;
    
    const modal = document.getElementById('view-modal');
    const overlay = document.getElementById('modal-overlay');
    
    const composition = getDetailedComposition(order);
    const price = calculateOrderPrice(order);
    
    modal.innerHTML = `
        <div class="modal-header">
            <h3>Просмотр заказа</h3>
            <button class="modal-close" onclick="closeModal('view-modal')">&times;</button>
        </div>
        <div class="modal-body">
            <div class="order-info-group">
                <label>Дата оформления</label>
                <p class="info-value">${formatDateTime(order.created_at)}</p>
            </div>
            
            <div class="order-info-group">
                <label>Доставка</label>
                <p class="info-value">${formatDeliveryTime(order)}</p>
            </div>
            
            <div class="order-info-group">
                <label>Имя получателя</label>
                <p class="info-value">${order.full_name}</p>
            </div>
            
            <div class="order-info-group">
                <label>Адрес доставки</label>
                <p class="info-value">${order.delivery_address}</p>
            </div>
            
            <div class="order-info-group">
                <label>Время доставки</label>
                <p class="info-value">${formatDeliveryTime(order)}</p>
            </div>
            
            <div class="order-info-group">
                <label>Телефон</label>
                <p class="info-value">${order.phone}</p>
            </div>
            
            <div class="order-info-group">
                <label>Email</label>
                <p class="info-value">${order.email}</p>
            </div>
            
            <div class="order-info-group">
                <label>Комментарий</label>
                <p class="info-value">${order.comment || 'Нет комментария'}</p>
            </div>
            
            <div class="order-info-group">
                <label>Состав заказа</label>
                ${composition}
            </div>
            
            <div class="order-info-group">
                <label>Стоимость:</label>
                <p class="order-total-price">${price}₽</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="modal-btn primary" onclick="closeModal('view-modal')">ОК</button>
        </div>
    `;
    
    overlay.classList.add('active');
    modal.classList.add('active');
}

function getDetailedComposition(order) {
    let html = '<ul class="order-composition-list">';
    
    const categoryLabels = {
        soup_id: 'Основное блюдо',
        main_course_id: 'Основное блюдо',
        salad_id: 'Салат',
        drink_id: 'Напиток',
        dessert_id: 'Десерт'
    };
    
    if (order.soup_id) {
        const dish = dishes.find(d => d.id === order.soup_id);
        if (dish) {
            html += `<li>Суп: ${dish.name} (${dish.price}₽)</li>`;
        }
    }
    
    if (order.main_course_id) {
        const dish = dishes.find(d => d.id === order.main_course_id);
        if (dish) {
            html += `<li>Основное блюдо: ${dish.name} (${dish.price}₽)</li>`;
        }
    }
    
    if (order.salad_id) {
        const dish = dishes.find(d => d.id === order.salad_id);
        if (dish) {
            html += `<li>Салат: ${dish.name} (${dish.price}₽)</li>`;
        }
    }
    
    if (order.drink_id) {
        const dish = dishes.find(d => d.id === order.drink_id);
        if (dish) {
            html += `<li>Напиток: ${dish.name} (${dish.price}₽)</li>`;
        }
    }
    
    if (order.dessert_id) {
        const dish = dishes.find(d => d.id === order.dessert_id);
        if (dish) {
            html += `<li>Десерт: ${dish.name} (${dish.price}₽)</li>`;
        }
    }
    
    html += '</ul>';
    return html;
}

function editOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    currentOrder = order;
    
    const modal = document.getElementById('edit-modal');
    const overlay = document.getElementById('modal-overlay');
    
    const composition = getDetailedComposition(order);
    const price = calculateOrderPrice(order);
    
    const deliveryTypeNow = order.delivery_type === 'now' ? 'checked' : '';
    const deliveryTypeByTime = order.delivery_type === 'by_time' ? 'checked' : '';
    const deliveryTimeValue = order.delivery_time || '';
    const deliveryTimeDisabled = order.delivery_type === 'now' ? 'disabled' : '';
    
    modal.innerHTML = `
        <div class="modal-header">
            <h3>Редактирование заказа</h3>
            <button class="modal-close" onclick="closeModal('edit-modal')">&times;</button>
        </div>
        <div class="modal-body">
            <form id="edit-order-form">
                <div class="order-info-group">
                    <label>Дата оформления</label>
                    <p class="info-value">${formatDateTime(order.created_at)}</p>
                </div>
                
                <div class="order-info-group">
                    <label>Доставка</label>
                    <p class="info-value">${formatDeliveryTime(order)}</p>
                </div>
                
                <div class="order-info-group">
                    <label for="edit-name">Имя получателя</label>
                    <input type="text" id="edit-name" name="full_name" value="${order.full_name}" required>
                </div>
                
                <div class="order-info-group">
                    <label for="edit-address">Адрес доставки</label>
                    <input type="text" id="edit-address" name="delivery_address" value="${order.delivery_address}" required>
                </div>
                
                <div class="order-info-group">
                    <label for="edit-time">Время доставки</label>
                    <input type="time" id="edit-time" name="delivery_time" value="${deliveryTimeValue}" min="07:00" max="23:00" step="300" ${deliveryTimeDisabled}>
                </div>
                
                <div class="order-info-group">
                    <label for="edit-phone">Телефон</label>
                    <input type="tel" id="edit-phone" name="phone" value="${order.phone}" required>
                </div>
                
                <div class="order-info-group">
                    <label for="edit-email">Email</label>
                    <input type="email" id="edit-email" name="email" value="${order.email}" required>
                </div>
                
                <div class="order-info-group">
                    <label for="edit-comment">Комментарий</label>
                    <textarea id="edit-comment" name="comment">${order.comment || ''}</textarea>
                </div>
                
                <div class="order-info-group">
                    <label>Состав заказа</label>
                    ${composition}
                </div>
                
                <div class="order-info-group">
                    <label>Стоимость:</label>
                    <p class="order-total-price">${price}₽</p>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="modal-btn secondary" onclick="closeModal('edit-modal')">Отмена</button>
            <button class="modal-btn primary" onclick="saveOrder()">Сохранить</button>
        </div>
    `;
    
    overlay.classList.add('active');
    modal.classList.add('active');
}

async function saveOrder() {
    const form = document.getElementById('edit-order-form');
    const formData = new FormData(form);
    
    const updatedData = {
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        delivery_address: formData.get('delivery_address'),
        delivery_type: currentOrder.delivery_type,
        delivery_time: formData.get('delivery_time') || '',
        comment: formData.get('comment') || ''
    };
    
    try {
        const response = await fetch(`${API_URL}/orders/${currentOrder.id}?api_key=${API_KEY}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при сохранении заказа');
        }
        
        closeModal('edit-modal');
        showNotification('Заказ успешно изменён', 'success');
        await loadOrders();
        
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Не удалось сохранить изменения: ' + error.message, 'error');
    }
}

function deleteOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    currentOrder = order;
    
    const modal = document.getElementById('delete-modal');
    const overlay = document.getElementById('modal-overlay');
    
    modal.innerHTML = `
        <div class="modal-header">
            <h3>Удаление заказа</h3>
            <button class="modal-close" onclick="closeModal('delete-modal')">&times;</button>
        </div>
        <div class="modal-body">
            <div class="delete-confirmation">
                <p>Вы уверены, что хотите удалить заказ?</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="modal-btn secondary" onclick="closeModal('delete-modal')">Отмена</button>
            <button class="modal-btn danger" onclick="confirmDelete()">Да</button>
        </div>
    `;
    
    overlay.classList.add('active');
    modal.classList.add('active');
}

async function confirmDelete() {
    try {
        const response = await fetch(`${API_URL}/orders/${currentOrder.id}?api_key=${API_KEY}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при удалении заказа');
        }
        
        closeModal('delete-modal');
        showNotification('Заказ успешно удалён', 'success');
        await loadOrders();
        
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Не удалось удалить заказ: ' + error.message, 'error');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modal-overlay');
    
    modal.classList.remove('active');
    overlay.classList.remove('active');
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    
    notification.innerHTML = `<p>${message}</p>`;
    notification.className = `notification-popup ${type} active`;
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 2000);
}
