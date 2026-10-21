document.addEventListener("DOMContentLoaded", () => {
    displayCart();

    const orderButton = document.getElementById("order-btn");
    orderButton.addEventListener("click", submitOrder);
});

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        return [];
    }
}

function displayCart() {
    const cart = getCart();
    const cartItemsTbody = document.getElementById("cart-items");
    const cartTotalHeader = document.getElementById("cart-total");

    cartItemsTbody.innerHTML = "";

    if (cart.length === 0) {
        cartItemsTbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center;">
                    カートに商品が入っていません。
                </td>
            </tr>
        `;
        cartTotalHeader.innerText = "合計: ¥0";
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        const subtotal = price * quantity;
        total += subtotal;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHtml(item.name)}</td>
            <td style="text-align: right;">¥${price.toLocaleString()}</td>
            <td style="text-align: center;">${quantity}</td>
            <td style="text-align: right;">¥${subtotal.toLocaleString()}</td>
        `;

        cartItemsTbody.appendChild(row);
    });

    cartTotalHeader.innerText = `合計: ¥${total.toLocaleString()}`;
}

// カート内の全商品を注文する
async function submitOrder() {
    const orderButton = document.getElementById("order-btn");
    const orderMessage = document.getElementById("order-message");
    const cart = getCart();

    orderMessage.textContent = "";

    if (cart.length === 0) {
        orderMessage.textContent = "カートに商品が入っていません。";
        return;
    }

    orderButton.disabled = true;

    try {
        // すべての商品を既存の注文APIへ順番に送信する
        for (const item of cart) {
            const productId = Number(item.id);
            const quantity = Number(item.quantity);

            if (
                !Number.isInteger(productId) ||
                productId <= 0 ||
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {
                throw new Error("商品IDまたは数量が正しくありません。");
            }

            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity
                })
            });

            if (!response.ok) {
                throw new Error(
                    `注文の保存に失敗しました（HTTP ${response.status}）。`
                );
            }
        }

        // すべての注文APIが成功した場合だけカートを空にする
        localStorage.setItem("cart", "[]");

        displayCart();
        orderMessage.textContent = "注文しました";
    } catch (error) {
        // 失敗時はカートを空にしない
        orderMessage.textContent =
            error.message || "注文に失敗しました。もう一度お試しください。";
    } finally {
        orderButton.disabled = false;
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