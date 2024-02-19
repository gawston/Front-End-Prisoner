const amount = document.querySelectorAll('input[name="amountproduct"]');
const cartAmount = document.querySelectorAll('input[name="cart-amount"]');

// Fix amount input
amount.forEach((input) => {
    input.addEventListener('change', () => {
        if(input.value < 1) {
            input.value = 1;
        }
        if(input.value > 99) {
            input.value = 99;
        }
    });
});

cartAmount.forEach((input) => {
    input.addEventListener('change', () => {
        if(input.value < 1) {
            input.value = 1;
        }
        if(input.value > 99) {
            input.value = 99;
        }
    });
});

