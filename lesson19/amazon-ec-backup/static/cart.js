document.addEventListener("DOMContentLoaded", () => {
    displayCart();
});

function displayCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsTbody = document.getElementById("cart-items");
    const cartTotalHeader = document.getElementById("cart-total");

    cartItemsTbody.innerHTML = "";

    if (cart.length === 0) {
        cartItemsTbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center;">カートに商品が入っていません。</td>
            </tr>
        `;
        cartTotalHeader.innerText = "合計: ¥0";
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHtml(item.name)}</td>
            <td style="text-align: right;">¥${item.price.toLocaleString()}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">¥${subtotal.toLocaleString()}</td>
        `;
        cartItemsTbody.appendChild(row);
    });

    cartTotalHeader.innerText = 
        `合計: ¥${total.toLocaleString()}`;
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m];
    });
}