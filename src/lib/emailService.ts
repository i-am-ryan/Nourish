import emailjs from '@emailjs/browser';

// Account 1 - General notifications
const EMAIL_CONFIG_1 = {
  publicKey: 'HueWjnmPU2Gca8Wnw',
  serviceId: 'service_2dw7zwt',
  templates: {
    taskAccepted: 'template_nkzdwgk', // volunteer_task_accepted template
    taskCompleted: 'template_1ri45l1' // volunteer_task_completed template
  }
};

// Account 2 - Task notifications
const EMAIL_CONFIG_2 = {
  publicKey: 'Q7mWO3UqZ7CcZ6FPG',
  serviceId: 'service_fmkpi3u',
  templates: {
    newTask: 'template_5pxntor', // volunteer_task_created template
    verificationApproved: 'template_m72re8a' // volunteer_verification_approved template
  }
};
export const sendNewTaskNotification = async (userEmail: string, userName: string, taskData: any) => {
  try {
    await emailjs.send(
      'service_fmkpi3u',
      'template_5pxntor', 
      {
        to_name: userName,
        to_email: userEmail,
        task_title: taskData.title,
        task_type: taskData.task_type,
        task_priority: taskData.priority,
        task_location: `${taskData.city}${taskData.suburb ? ', ' + taskData.suburb : ''}`,
        scheduled_date: taskData.scheduled_date ? new Date(taskData.scheduled_date).toLocaleDateString() : 'Flexible timing',
        task_description: taskData.description,
        volunteer_tasks_link: 'https://nourish-two.vercel.app/#notifications',
        site_link: 'https://nourish-two.vercel.app'
      },
      'Q7mWO3UqZ7CcZ6FPG'
    );
    console.log(`Email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send email to ${userEmail}:`, error);
  }
};

// Temporary simplified version for testing
export const sendTaskAcceptedNotification = async (userEmail: string, userName: string, taskData: any) => {
  try {
    await emailjs.send(
      'service_2dw7zwt',
      'template_nkzdwgk',
      {
        to_name: userName || 'Volunteer',
        to_email: userEmail,
        task_title: 'Test Task',
        task_type: 'pickup',
        task_priority: 'medium',
        task_location: 'Test Location',
        scheduled_date: 'Today',
        task_description: 'Test Description',
        site_link: 'https://nourish-two.vercel.app'
      },
      'HueWjnmPU2Gca8Wnw'
    );
    console.log('✅ Simplified email sent successfully');
  } catch (error) {
    console.error('❌ Simplified email failed:', error);
  }
};

export const sendTaskCompletedNotification = async (userEmail: string, userName: string, taskData: any) => {
  try {
    await emailjs.send(
      'service_2dw7zwt',
      'template_1ri45l1',
      {
        to_name: userName,
        to_email: userEmail,
        task_title: taskData.title,
        task_type: taskData.task_type,
        task_description: taskData.description,
        volunteer_dashboard: 'https://nourish-two.vercel.app/volunteer',
        site_link: 'https://nourish-two.vercel.app'
      },
      'HueWjnmPU2Gca8Wnw'
    );
    console.log(`Task completed email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send task completed email to ${userEmail}:`, error);
  }
};

export const sendDonationConfirmationEmail = async (
  userEmail: string, 
  userName: string, 
  donationData: any, 
  hubData: any, 
  recipients: any[] = []
) => {
  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      donation_title: donationData.title,
      donation_description: donationData.description,
      food_type: donationData.food_type,
      quantity: donationData.quantity,
      expiry_date: donationData.expiry_date,
      dropoff_time: donationData.dropoff_time,
      hub_name: hubData.name,
      hub_location: `${hubData.city}${hubData.suburb ? ', ' + hubData.suburb : ''}`,
      hub_address: hubData.address || hubData.address_line1,
      maps_url: hubData.maps_url,
      recipients: recipients.length > 0,
      recipient_list: recipients.map(r => ({
        name: r.name,
        category: r.category,
        location: r.location,
        website: r.website,
        website_display: r.website.replace(/^https?:\/\//, '')
      })),
      site_link: 'https://nourish-two.vercel.app',
      volunteer_link: 'https://nourish-two.vercel.app/volunteer'
    };

    console.log('Sending donation confirmation email with params:', templateParams);

    await emailjs.send(
      'service_qi8442u',
      'template_ujw9x6e',
      templateParams,
      'IIfw_6SwNmO6YeG9z'
    );

    console.log(`Donation confirmation email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send donation confirmation email to ${userEmail}:`, error);
    throw error;
  }
};

export const sendFoodBagRequestEmail = async (
  userEmail: string, 
  userName: string, 
  bagData: {
    hub_name: string;
    hub_address: string;
    hub_city: string;
    hub_suburb: string;
    pickup_window: string;
    dietary_preferences: string;
    allergies?: string;
    notes?: string;
  }
) => {
  try {
    const templateParams = {
      to_email: userEmail,
      user_name: userName,
      hub_name: bagData.hub_name,
      hub_address: bagData.hub_address || '',
      hub_city: bagData.hub_city,
      hub_suburb: bagData.hub_suburb || '',
      pickup_window: bagData.pickup_window,
      dietary_preferences: bagData.dietary_preferences,
      allergies: bagData.allergies || '',
      notes: bagData.notes || '',
      site_link: 'https://nourish-two.vercel.app'
    };

    console.log('Sending food bag request email with params:', templateParams);

    await emailjs.send(
      'service_qi8442u',
      'template_h32oxcv', 
      templateParams,
      'IIfw_6SwNmO6YeG9z'
    );

    console.log(`Food bag request email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Failed to send food bag request email to ${userEmail}:`, error);
    throw error;
  }
};



export const sendVerificationApprovedNotification = async (userEmail: string, userName: string) => {
  try {
    const templateParams = {
      to_email: userEmail,  // This MUST match the "To" field in EmailJS
      to_name: userName,
      volunteer_dashboard:  'https://nourish-two.vercel.app/volunteer',
      site_link:  'https://nourish-two.vercel.app'
    };
    
    console.log('📧 Sending email with params:', templateParams);
    
    await emailjs.send(
      EMAIL_CONFIG_2.serviceId,        // service_fmkpi3u
      EMAIL_CONFIG_2.templates.verificationApproved,  // template_m72re8a
      templateParams,
      EMAIL_CONFIG_2.publicKey         // Q7mWO3UqZ7CcZ6FPG
    );
    
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Failed to send verification approved notification:', error);
    throw error;
  }
};