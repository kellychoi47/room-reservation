import { Users, Building2, Map } from 'lucide-react';
const items=[['users','People',Users],['rooms','Rooms',Building2],['plans','Floor plans',Map]];
export default function AdminTabs({activeTab,onChange}){return items.map(([id,label,Icon])=><button key={id} className={activeTab===id?'active':''} onClick={()=>onChange(id)}><Icon size={16}/>{label}</button>)}
