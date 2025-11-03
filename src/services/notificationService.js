import { db } from '../firebase';
import { doc, updateDoc } from "firebase/firestore";

import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export const notificationService = {
  // Create a new notification
  async createNotification(notificationData) {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        read: false,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Get notifications for a specific user
  getUserNotifications(userId, callback) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    });
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Send request accepted notification
  async sendRequestAcceptedNotification(request, volunteerName) {
    const notificationData = {
      userId: request.citizenId,
      type: 'request_accepted',
      title: 'Request Accepted!',
      message: `Your ${request.type} request has been accepted by ${volunteerName}`,
      requestId: request.id,
      volunteerId: request.volunteerId,
      data: {
        requestType: request.type,
        volunteerName: volunteerName,
        timestamp: new Date().toISOString()
      }
    };

    return await this.createNotification(notificationData);
  }
};