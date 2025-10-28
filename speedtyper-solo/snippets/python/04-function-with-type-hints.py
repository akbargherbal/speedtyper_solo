def calculate_total(price: float, quantity: int, tax_rate: float = 0.05) -> float:
    """Calculate the total cost including tax."""
    subtotal = price * quantity
    total = subtotal * (1 + tax_rate)
    return total

invoice_total = calculate_total(price=19.99, quantity=2)
print(f"Total: ${invoice_total:.2f}")