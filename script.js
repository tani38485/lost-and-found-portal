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
            showTab(button.getAttribute('onclick').replace("showTab('", "").replace("')", ""));
        });
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
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');

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
            itemsListDiv.innerHTML = ''; // ล้างข้อมูลเก่า
            data.forEach(item => {
                const itemCard = document.createElement('div');
                itemCard.className = 'item-card';

                const statusTagClass = item.Type === 'Lost' ? 'lost' : 'found';

                itemCard.innerHTML = `
                    <span class="status-tag ${statusTagClass}">${item.Type}</span>
                    <h3>${item.ItemName}</h3>
                    <p><span class="label">Description:</span> ${item.Description}</p>
                    <p><span class="label">Location:</span> ${item.Location}</p>
                    <p><span class="label">Contact:</span> ${item.ContactInfo}</p>
                    <p><span class="label">Posted On:</span> ${item.DatePosted}</p>
                    ${item.ImageURL ? `<img src="${item.ImageURL}" alt="${item.ItemName}">` : ''}
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

// ... โค้ดที่มีอยู่แล้วใน script.js ...

async function loadItems() {
    const itemsListDiv = document.getElementById('items-list');
    itemsListDiv.innerHTML = '<p>Loading items...</p>'; // แสดงสถานะโหลด

    try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getData`);
        const data = await response.json();

        if (data && data.length > 0) {
            // กรองและเรียงลำดับ: แสดง Active ก่อน, และเรียงจากใหม่ไปเก่า
            const activeItems = data.filter(item => item.Status !== 'Resolved');
            const resolvedItems = data.filter(item => item.Status === 'Resolved');

            const sortedActiveItems = activeItems.sort((a, b) => new Date(b.DatePosted) - new Date(a.DatePosted));
            const sortedResolvedItems = resolvedItems.sort((a, b) => new Date(b.DatePosted) - new Date(a.DatePosted));

            const displayItems = sortedActiveItems.concat(sortedResolvedItems); // แสดง Active ก่อน Resolved

            itemsListDiv.innerHTML = ''; // ล้างข้อมูลเก่า
            displayItems.forEach(item => {
                const itemCard = document.createElement('div');
                // เพิ่มคลาส 'resolved' ถ้าสถานะเป็น Resolved เพื่อจัดสไตล์
                itemCard.className = `item-card ${item.Status === 'Resolved' ? 'resolved' : ''}`;

                const statusTagClass = item.Type === 'Lost' ? 'lost' : 'found';

                // เพิ่มปุ่ม "Mark as Found/Resolved" ถ้าสถานะยังไม่ใช่ Resolved
                const actionButton = item.Status !== 'Resolved' ? 
                    `<button class="action-button mark-found-button" data-item-id="${item.ID}" data-item-name="${item.ItemName}">Mark as Resolved</button>` : '';

                itemCard.innerHTML = `
                    <span class="status-tag ${statusTagClass}">${item.Type}</span>
                    <h3 class="item-name">${item.ItemName}</h3>
                    <p><span class="label">Status:</span> <span class="item-status ${item.Status === 'Resolved' ? 'status-resolved' : 'status-active'}">${item.Status || 'Active'}</span></p>
                    <p><span class="label">Description:</span> ${item.Description}</p>
                    <p><span class="label">Location:</span> ${item.Location}</p>
                    <p><span class="label">Contact:</span> ${item.ContactInfo}</p>
                    <p><span class="label">Posted On:</span> ${item.DatePosted}</p>
                    ${item.ImageURL ? `<img src="${item.ImageURL}" alt="${item.ItemName}">` : ''}
                    ${actionButton}
                `;
                itemsListDiv.appendChild(itemCard);
            });

            // เพิ่ม Event Listener ให้กับปุ่ม "Mark as Resolved" ทั้งหมด
            document.querySelectorAll('.mark-found-button').forEach(button => {
                button.addEventListener('click', handleMarkAsResolved);
            });

        } else {
            itemsListDiv.innerHTML = '<p>No items found yet.</p>';
        }
    } catch (error) {
        console.error('Error loading items:', error);
        itemsListDiv.innerHTML = '<p style="color: red;">Error loading items. Please try again later.</p>';
    }
}

// ฟังก์ชันใหม่สำหรับจัดการการคลิกปุ่ม "Mark as Resolved"
async function handleMarkAsResolved(event) {
    const itemId = event.target.dataset.itemId;
    const itemName = event.target.dataset.itemName;
    
    // ขอรหัสผ่านเพื่อยืนยันการเปลี่ยนสถานะ
    const password = prompt(`Enter admin password to mark "${itemName}" (ID: ${itemId}) as Resolved:`);
    if (!password) {
        alert('Password required to change status.');
        return;
    }

    if (!confirm(`Are you sure you want to mark "${itemName}" (ID: ${itemId}) as RESOLVED? This action cannot be undone.`)) {
        return;
    }

    event.target.textContent = 'Updating...';
    event.target.disabled = true;

    const formData = new FormData();
    formData.append('action', 'updateStatus');
    formData.append('password', password);
    formData.append('itemId', itemId);
    formData.append('newStatus', 'Resolved'); // สถานะใหม่

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
            event.target.textContent = 'Mark as Resolved';
            event.target.disabled = false;
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Network error or server issue. Could not update status.');
        event.target.textContent = 'Mark as Resolved';
        event.target.disabled = false;
    }
}

// ... ส่วนโค้ดอื่นๆ ของ script.js (handlePostSubmit, showTab) ...
