document.addEventListener("DOMContentLoaded", () => {
    loadOrders();
});

async function loadOrders() {
    const ordersItemsTbody = document.getElementById("orders-items");
    const ordersTotalHeader = document.getElementById("orders-total");
    const ordersMessage = document.getElementById("orders-message");

    try {
        const response = await fetch("/api/orders");

        if (!response.ok) {
            throw new Error(
                `注文履歴の取得に失敗しました（HTTP ${response.status}）。`
            );
        }

        const orders = await response.json();

        ordersItemsTbody.innerHTML = "";
        ordersMessage.textContent = "";

        if (!Array.isArray(orders) || orders.length === 0) {
            ordersItemsTbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center;">
                        注文履歴がありません。
                    </td>
                </tr>
            `;
            ordersTotalHeader.textContent = "合計: ¥0";
            return;
        }

        let total = 0;

        orders.forEach(order => {
            const price = Number(order.price) || 0;
            const quantity = Number(order.quantity) || 0;
            const subtotal = price * quantity;

            total += subtotal;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${escapeHtml(order.product_name)}</td>
                <td style="text-align: right;">
                    ¥${price.toLocaleString()}
                </td>
                <td style="text-align: center;">
                    ${quantity}
                </td>
                <td style="text-align: right;">
                    ¥${subtotal.toLocaleString()}
                </td>
            `;

            ordersItemsTbody.appendChild(row);
        });

        ordersTotalHeader.textContent =
            `合計: ¥${total.toLocaleString()}`;

    } catch (error) {
        ordersItemsTbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center;">
                    注文履歴を表示できませんでした。
                </td>
            </tr>
        `;

        ordersTotalHeader.textContent = "合計: ¥0";
        ordersMessage.textContent =
            error.message || "エラーが発生しました。";
    }
}

function escapeHtml(str) {
    if (str === null || str === undefined) {
        return "";
    }

    return String(str).replace(/[&<>"']/g, function (m) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[m];
    });
}