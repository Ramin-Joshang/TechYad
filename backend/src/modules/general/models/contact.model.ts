import mongoose, { Document, Schema } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  status: 'pending' | 'read' | 'replied' | 'archived';
  replyNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContactMessage>({
  name: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['pending', 'read', 'replied', 'archived'], 
    default: 'pending',
    index: true 
  },
  replyNotes: { type: String }
}, { timestamps: true });

export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', contactSchema);
