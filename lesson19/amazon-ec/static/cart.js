document.addEventListener("DOMContentLoaded", () => {
    displayCart();
    document.getElementById("order-btn").addEventListener("click", submitOrder);
});

function getCart() {
    try { return JSON.parse(localStorage.getItem("cart")) || []; }
    catch { return []; }
}

function displayCart() {
    const cart = getCart();
    const tbody = document.getElementById("cart-items");
    const totalHeader = document.getElementById("cart-total");
    tbody.innerHTML = "";
    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">カートに商品が入っていません。</td></tr>';
        totalHeader.innerText = "合計: ¥0";
        document.getElementById("order-btn").disabled = true;
        return;
    }
    document.getElementById("order-btn").disabled = false;
    let total = 0;
    cart.forEach(item => {
        const subtotal = Number(item.price) * Number(item.quantity);
        total += subtotal;
        const row = document.createElement("tr");
        row.innerHTML = `<td>${escapeHtml(item.name)}</td>
            <td style="text-align:right;">¥${Number(item.price).toLocaleString()}</td>
            <td style="text-align:center;">${Number(item.quantity)}</td>
            <td style="text-align:right;">¥${subtotal.toLocaleString()}</td>`;
        tbody.appendChild(row);
    });
    totalHeader.innerText = `合計: ¥${total.toLocaleString()}`;
}

async function submitOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("カートに商品が入っていません。");
        return;
    }
    const button = document.getElementById("order-btn");
    const message = document.getElementById("order-message");
    button.disabled = true;
    message.innerText = "注文を処理しています...";
    try {
        for (const item of cart) {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({product_id: Number(item.id), quantity: Number(item.quantity)})
            });
            if (!response.ok) throw new Error("注文処理に失敗しました。");
            await response.json();
        }
        localStorage.removeItem("cart");
        message.innerText = "注文しました";
        displayCart();
    } catch (error) {
        console.error(error);
        message.innerText = "注文に失敗しました。カートの商品は残っています。もう一度お試しください。";
        button.disabled = false;
    }
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}
