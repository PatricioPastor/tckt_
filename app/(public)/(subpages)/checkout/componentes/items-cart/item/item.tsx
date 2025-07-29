import { CartItem } from "@/lib/store/cart-store"
import { Minus, Plus } from "@untitledui/icons"


export const ItemFromCart = ({ item, handleQuantityChange }: { item: CartItem, handleQuantityChange: (type: string, delta: number) => void }) => {
  return (
    <div key={item.type} className="gradient-bg mb-4 shadow border-[0.5px] border-gray-500 flex flex-col gap-2 items-start justify-between rounded-[12px] p-3">
      <div className="flex items-center gap-2">
        <p className="text-white text-2xl font-bold uppercase">${item.price.toLocaleString()}</p>
        {/* <p className="text-white font-bold uppercase">{item.quantity}</p> */}
      </div>

      <div className="flex items-center justify-between w-full relative">
        <p className="font-semibold text-base tracking-tighter">{item.type.toUpperCase()}</p>

        <div className="flex items-center gap-2">
          <button onClick={() => handleQuantityChange(item.type, -1)} className="text-white"><Minus size={20} /></button>
          <span className="text-white text-lg font-bold">{item.quantity}</span>
          <button onClick={() => handleQuantityChange(item.type, 1)} className="text-white"><Plus size={20} /></button>
        </div>
      </div>
    </div>
  )
}
