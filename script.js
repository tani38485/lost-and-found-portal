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