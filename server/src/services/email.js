import { Resend } from 'resend';
const resend=process.env.RESEND_API_KEY?new Resend(process.env.RESEND_API_KEY):null;
export async function notifyReservation(reservation,kind){if(!resend)return;const action=kind==='cancelled'?'cancelled':'confirmed';await resend.emails.send({from:process.env.EMAIL_FROM,to:reservation.profiles.email,subject:`Reservation ${action}: ${reservation.rooms.name}`,html:`<h2>Your reservation is ${action}</h2><p><strong>${reservation.title}</strong><br/>${reservation.rooms.name}<br/>${new Date(reservation.start_time).toLocaleString()}</p>`})}
