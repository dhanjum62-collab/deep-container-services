const scriptURL = 'https://script.google.com/macros/s/AKfycby63_OjH0KjbZRQNQ1zzjzmWaJiiMFKQM33ckiD9uCTIwX9NUTq4K6y9bCmInSR8bXlVg/exec';

let globalData = []; 

window.onload = async () => {
    try {
        const response = await fetch(scriptURL);
        globalData = await response.json();
        
        if(document.getElementById('nextInvNum')) {
            const nextNum = 100 + globalData.length;
            document.getElementById('nextInvNum').innerText = "INV-" + nextNum;
        }

        if(document.getElementById('tableBody')) {
            renderAdminData(globalData);
        }
    } catch (e) {
        console.error("Error:", e);
        if(document.getElementById('loadingText')) document.getElementById('loadingText').innerText = "Error Loading Data.";
    }
};

function renderAdminData(data) {
    const tableBody = document.getElementById('tableBody');
    const rows = data.slice(1);
    let totalIncome = 0;

    tableBody.innerHTML = "";
    document.getElementById('loadingText').style.display = "none";

    rows.reverse().forEach((row) => {
        if(!row[0]) return;
        const tr = document.createElement('tr');
        const amount = parseFloat(row[4] || 0);
        
        // Table display date format
        let dDate = row[1];
        try { dDate = new Date(row[1]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); } catch(e){}

        tr.innerHTML = `
            <td><strong>${row[0]}</strong></td>
            <td>${dDate}</td>
            <td>${row[2]}</td>
            <td>$${amount.toFixed(2)}</td>
            <td><button class="btn-view" onclick='openPreview(${JSON.stringify(row)})'>👁️ View</button></td>
        `;
        tableBody.appendChild(tr);
        totalIncome += amount;
    });

    document.getElementById('totalEarnings').innerText = "$" + totalIncome.toFixed(2);
    document.getElementById('totalInvoices').innerText = rows.length;
}

function openPreview(rowData) {
    const modal = document.getElementById('previewModal');
    const billArea = document.getElementById('modalBillArea');
    modal.style.display = "block";

    // --- DATE FIX ---
    let displayDate = rowData[1];
    try {
        const dObj = new Date(rowData[1]);
        if(!isNaN(dObj)) {
            displayDate = dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
    } catch(e){}
    // ----------------

    const amount = parseFloat(rowData[4] || 0).toFixed(2);

    billArea.innerHTML = `
        <div style="font-family: Arial; padding: 10px; color: #000;">
            <div style="text-align: center;">
                <h1 style="margin:0; font-size:28px;">DEEP CONTAINER SERVICES</h1>
                <p style="margin:5px 0;">Brampton, ON | Business Invoice</p>
            </div>
            <hr style="border: 1px solid #000; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div><strong>BILL TO:</strong><br><span style="font-size: 18px;">${rowData[2]}</span></div>
                <div style="text-align: right;"><strong>Invoice #:</strong> ${rowData[0]}<br><strong>Date:</strong> ${displayDate}</div>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: #f2f2f2;">
                        <th style="border: 1px solid #000; padding: 12px; text-align: left;">Description</th>
                        <th style="border: 1px solid #000; padding: 12px; text-align: right; width: 120px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #000; padding: 12px; height: 180px; vertical-align: top;">${rowData[3]}</td>
                        <td style="border: 1px solid #000; padding: 12px; text-align: right; vertical-align: top; font-weight: bold;">$${amount}</td>
                    </tr>
                </tbody>
            </table>
            <div style="text-align: right;"><h2 style="margin: 0; font-size: 24px;">GRAND TOTAL: $${amount}</h2></div>
            <div style="margin-top: 60px; display: flex; justify-content: space-between;">
                <p style="border-top: 1px solid #000; width: 200px; text-align: center;">Authorized Signature</p>
                <p style="font-style: italic;">Thank you for your business!</p>
            </div>
        </div>
    `;

    document.getElementById('modalWA').onclick = () => {
        const msg = `*Deep Container Services*\n*Invoice:* ${rowData[0]}\n*Date:* ${displayDate}\n*Total:* $${amount}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };
}

function closeModal() { document.getElementById('previewModal').style.display = "none"; }

function exportCSV(days) {
    const headers = ["Invoice No", "Date", "Client Name", "Description", "Amount"];
    const now = new Date();
    const filteredRows = globalData.slice(1).filter(row => {
        const rowDate = new Date(row[1]);
        return ((now - rowDate) / (1000 * 60 * 60 * 24)) <= days;
    });
    if(filteredRows.length === 0) return alert("No records found.");
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + filteredRows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Deep_Report_${days}Days.csv`;
    link.click();
}