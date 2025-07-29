
import { ItemFromCart } from './item/item'
import { useCartStore } from '@/lib/store/cart-store'

export const ItemsCart = () => {
  const { items, updateQuantity } = useCartStore();

  const handleQuantityChange = (type: string, delta: number) => {
    const item = items.find(i => i.type === type);
    if (!item) return;
    
    const newQty = item.quantity + delta;
    updateQuantity(type as any, newQty, item.price, item.maxStock);
    
  };

  return (
    <div>
      {items.map(item => (
        <ItemFromCart key={item.type} item={item} handleQuantityChange={handleQuantityChange} />
      ))}
    </div>
  )
}
