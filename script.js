// *** เปลี่ยนตรงนี้เป็น Web App URL ของ Google Apps Script ของคุณ ***
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwudcHfoou4uT-4JYWogOjpeiZ2wserNMUPOy2c1jkDc2gHGMp5Q89I3DwO1rElU6vQ/exec'; 

document.addEventListener('DOMContentLoaded', () => {
    loadItems(); // โหลดข้อมูลเมื่อหน้าเว็บโหลดเสร็จ
    
    // ตั้งค่า Event Listener สำหรับ Submit Form
    const postForm = document.getElementById('post-form');
    postForm.addEventListener('submit', handlePostSubmit);

    // ตั้งค่า Event Listener สำหรับ Tab Buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            showTab(button.getAttribute('data-tab')); // เปลี่ยนเป็น data-tab เพื่อความยืดหยุ่น
        });
    });

    // Event Delegation สำหรับปุ่ม Action ในรายการ (สำคัญมาก)
    document.getElementById('items-list').addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('action-button')) {
            const itemId = target.dataset.itemId;
            const itemName = target.dataset.itemName;
            const currentStatus = target.dataset.currentStatus;
            const targetStatus = target.dataset.targetStatus; // สถานะที่ปุ่มนี้จะเปลี่ยนไป
            handleStatusChange(itemId, itemName, currentStatus, targetStatus, target);
        }
    });
});

// ฟังก์ชันสลับ Tab
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active'); // เปลี่ยนเป็น data-tab

    // ถ้าเปลี่ยนมาที่ View Items tab ให้โหลดข้อมูลใหม่
    if (tabId === 'viewItems') {
        loadItems();
    }
}

// ฟังก์ชันโหลดข้อมูลจาก Google Apps Script
async function loadItems() {
    const itemsListDiv = document.getElementById('items-list');
    itemsListDiv.innerHTML = '<p>Loading items...</p>'; // แสดงสถานะโหลด

    try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getData`);
        const data = await response.json();

        if (data && data.length > 0) {
            // กรองและเรียงลำดับ: Active/Pending ก่อน, แล้ว Resolved, และเรียงจากใหม่ไปเก่า
            const activePendingItems = data.filter(item => item.Status !== 'Resolved');
            const resolvedItems = data.filter(item => item.Status === 'Resolved');

            const sortedActivePendingItems = activePendingItems.sort((a, b) => new Date(b.DatePosted) - new Date(a.DatePosted));
            const sortedResolvedItems = resolvedItems.sort((a, b) => new Date(b.DatePosted) - new Date(a.DatePosted));

            const displayItems = sortedActivePendingItems.concat(sortedResolvedItems); // แสดง Active/Pending ก่อน Resolved

            itemsListDiv.innerHTML = ''; // ล้างข้อมูลเก่า
            displayItems.forEach(item => {
                const itemCard = document.createElement('div');
                // เพิ่มคลาสตามสถานะเพื่อจัดสไตล์
                itemCard.className = `item-card status-${item.Status ? item.Status.toLowerCase() : 'active'}`;

                const typeTagClass = item.Type === 'Lost' ? 'lost' : 'found';

                // สร้างปุ่ม Action ตามสถานะปัจจุบัน
                // ... ในฟังก์ชัน loadItems() ภายใน itemCard.innerHTML ...

                // สร้างปุ่ม Action ตามสถานะปัจจุบัน
                let actionButtonsHtml = '';
                const currentStatus = item.Status || 'Active'; // default to Active if undefined
                
                if (currentStatus === 'Active') {
                    actionButtonsHtml += `<button class="action-button status-change-button pending-button" data-item-id="${item.ID}" data-item-name="${item.ItemName}" data-current-status="${currentStatus}" data-target-status="Pending">Mark as Pending</button>`;
                    actionButtonsHtml += `<button class="action-button status-change-button resolved-button" data-item-id="${item.ID}" data-item-name="${item.ItemName}" data-current-status="${currentStatus}" data-target-status="Resolved">Mark as Resolved</button>`;
                } else if (currentStatus === 'Pending') {
                    actionButtonsHtml += `<button class="action-button status-change-button active-button" data-item-id="${item.ID}" data-item-name="${item.ItemName}" data-current-status="${currentStatus}" data-target-status="Active">Mark as Active</button>`;
                    actionButtonsHtml += `<button class="action-button status-change-button resolved-button" data-item-id="${item.ID}" data-item-name="${item.ItemName}" data-current-status="${currentStatus}" data-target-status="Resolved">Mark as Resolved</button>`;
                } else if (currentStatus === 'Resolved') {
                    // ไม่มีปุ่ม action สำหรับ Resolved
                    actionButtonsHtml += '<span class="resolved-message">This item has been resolved.</span>';
                }
                
                // ... ใน itemCard.innerHTML จะมี div ที่ใช้ actionButtonsHtml ...
                const currentStatus = item.Status || 'Active'; // default to Active if undefined

                if (currentStatus === 'Active') {
                    actionButtonsHtml += `<button class="action-button status-change-button pending-button" data-item-id="${item.ID}" data-item-name="${item.ItemName}" data-current-status="${currentStatus}" data-target-status="Pending">Mark as Pending</button>`;
                    actionButtonsHtml += `<button class="action-button status-change-button resolved-button" data-item-id="${item.ID}" data-item-name="${item.ItemName}" data-current-status="${currentStatus}" data-target-status="Resolved">Mark as Resolved</button>`;
                } else if (currentStatus === 'Pending') {
                    actionButtonsHtml += `<button class="action-button status-change-button active-button" data-item-id="${item.ID}" data-item-name="${item.ItemName}" data-current-status="${currentStatus}" data-target-status="Active">Mark as Active</button>`;
                    actionButtonsHtml += `<button class="action-button status-change-button resolved-button" data-item-id="${item.ID}" data-item-name="${item.ItemName}" data-current-status="${currentStatus}" data-target-status="Resolved">Mark as Resolved</button>`;
                } else if (currentStatus === 'Resolved') {
                    // ไม่มีปุ่ม action สำหรับ Resolved
                    actionButtonsHtml += '<span class="resolved-message">This item has been resolved.</span>';
                }

                itemCard.innerHTML = `
                
                    <span class="status-tag ${typeTagClass}">${item.Type}</span>
                    <h3 class="item-name">${item.ItemName}</h3>
                    <p><span class="label">Status:</span> <span class="item-status status-${currentStatus.toLowerCase()}">${currentStatus}</span></p>
                    <p><span class="label">Description:</span> ${item.Description || 'N/A'}</p>
                    <p><span class="label">Location:</span> ${item.Location}</p>
                    <p><span class="label">Contact:</span> ${item.ContactInfo}</p>
                    <p><span class="label">Posted On:</span> ${item.DatePosted}</p>
                    ${item.ImageURL ? `<img src="${item.ImageURL}" alt="${item.ItemName}">` : ''}
                    <div class="item-actions">
                        ${actionButtonsHtml}
                    </div>
                `;
                itemsListDiv.appendChild(itemCard);
            });

        } else {
            itemsListDiv.innerHTML = '<p>No items found yet.</p>';
        }
    } catch (error) {
        console.error('Error loading items:', error);
        itemsListDiv.innerHTML = '<p style="color: red;">Error loading items. Please try again later.</p>';
    }
}
async function handleStatusChange(itemId, itemName, currentStatus, targetStatus, buttonElement) {
    const actionText = targetStatus === 'Resolved' ? 'RESOLVED' : targetStatus.toUpperCase();
    const confirmationMessage = `Are you sure you want to mark "${itemName}" (ID: ${itemId}) as ${actionText}?`;
    
    const password = prompt(`Enter admin password to mark "${itemName}" (ID: ${itemId}) as ${actionText}:`);
    if (!password) {
        alert('Password required to change status.');
        return;
    }

    if (!confirm(confirmationMessage)) {
        return;
    }

    // Disable all action buttons for this item during update
    const itemCard = buttonElement.closest('.item-card');
    const allButtons = itemCard.querySelectorAll('.action-button');
    allButtons.forEach(btn => {
        btn.textContent = 'Updating...';
        btn.disabled = true;
    });

    const formData = new FormData();
    formData.append('action', 'updateStatus');
    formData.append('password', password);
    formData.append('itemId', itemId);
    formData.append('newStatus', targetStatus);
    
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === 'success') {
            alert(result.message);
            loadItems(); // โหลดข้อมูลใหม่เพื่อให้สถานะอัปเดตบนหน้าเว็บ
        } else {
            alert(`Error: ${result.message}`);
            // Restore button states if error
            allButtons.forEach(btn => {
                const initialTargetStatus = btn.dataset.targetStatus;
                if (initialTargetStatus === 'Pending') btn.textContent = 'Mark as Pending';
                else if (initialTargetStatus === 'Resolved') btn.textContent = 'Mark as Resolved';
                else if (initialTargetStatus === 'Active') btn.textContent = 'Mark as Active';
                btn.disabled = false;
            });
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Network error or server issue. Could not update status.');
        allButtons.forEach(btn => {
            const initialTargetStatus = btn.dataset.targetStatus;
            if (initialTargetStatus === 'Pending') btn.textContent = 'Mark as Pending';
            else if (initialTargetStatus === 'Resolved') btn.textContent = 'Mark as Resolved';
            else if (initialTargetStatus === 'Active') btn.textContent = 'Mark as Active';
            btn.disabled = false;
        });
    }
}


// ฟังก์ชันจัดการการ Submit Form
async function handlePostSubmit(event) {
    event.preventDefault(); // ป้องกันการ reload หน้าเว็บ

    const postStatus = document.getElementById('post-status');
    postStatus.style.color = 'black';
    postStatus.textContent = 'Submitting...';

    const password = document.getElementById('post-password').value;
    const type = document.getElementById('type').value;
    const itemName = document.getElementById('itemName').value;
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;
    const contactInfo = document.getElementById('contactInfo').value;
    const imageURL = document.getElementById('imageURL').value;

    if (!password || !type || !itemName || !location || !contactInfo) {
        postStatus.style.color = 'red';
        postStatus.textContent = 'Please fill in all required fields (including password).';
        return;
    }

    const formData = new FormData();
    formData.append('action', 'postData');
    formData.append('password', password);
    formData.append('type', type);
    formData.append('itemName', itemName);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('contactInfo', contactInfo);
    formData.append('imageURL', imageURL);
    // ไม่ต้องส่งสถานะ เพราะ Apps Script จะตั้งเป็น Active เริ่มต้น

    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.status === 'success') {
            postStatus.style.color = 'green';
            postStatus.textContent = result.message;
            postForm.reset(); // ล้างฟอร์ม
            showTab('viewItems'); // ไปที่หน้าแสดงข้อมูล
        } else {
            postStatus.style.color = 'red';
            postStatus.textContent = result.message || 'Error submitting data.';
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        postStatus.style.color = 'red';
        postStatus.textContent = 'Network error or server issue. Please try again.';
    }

}


