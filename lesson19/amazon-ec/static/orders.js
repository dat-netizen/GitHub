document.addEventListener("DOMContentLoaded", loadOrders);

async function loadOrders() {
    const tbody = document.getElementById("orders-items");
    const message = document.getElementById("orders-message");
    try {
        const response = await fetch("/api/orders");
        if (!response.ok) throw new Error("注文履歴の取得に失敗しました。");
        const orders = await response.json();
        tbody.innerHTML = "";
        if (!orders || orders.length === 0) {
            message.innerText = "注文履歴はありません。";
            return;
        }
        message.innerText = "";
        orders.forEach(order => {
            const subtotal = order.Price * order.Quantity;
            const row = document.createElement("tr");
            row.innerHTML = `<td>${escapeHtml(order.CreatedAt)}</td>
                <td>${escapeHtml(order.ProductName)}</td>
                <td style="text-align:right;">¥${Number(order.Price).toLocaleString()}</td>
                <td style="text-align:center;">${Number(order.Quantity)}</td>
                <td style="text-align:right;">¥${subtotal.toLocaleString()}</td>`;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        message.innerText = "注文履歴を読み込めませんでした。サーバーが起動しているか確認してください。";
    }
}

function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}
