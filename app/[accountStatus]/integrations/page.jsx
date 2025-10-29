'use client'

const integrations = [
  {
    name: 'Google Calendar',
    description: 'Sync your calendar and manage availability for expert sessions. This will allow you to automatically schedule your expert sessions.',
    icon: '/Google-Calendar.png',
  },
  {
    name: 'Google Meet',
    description: 'Host video meetings directly from your expert sessions. This will allow you to host your expert sessions directly from your Google Meet account.',
    icon: '/google-meet.png',
  },
  {
    name: 'Gmail',
    description: 'Gmail is a email service that allows you to manage your expert sessions directly from your Gmail account.',
    icon: '/gmail.png',
  },
  {
    name: 'Zoom',
    description: 'Professional video conferencing for your expert sessions. This will allow you to host your expert sessions directly from your Zoom account.',
    icon: '/zoom-icon.png',
  },
  {
    name: 'Razorpay',
    description: 'Accept payments for your expert sessions. This will allow you to accept payments for your expert sessions directly from your Razorpay account.',
    icon: '/razorpay-icon.png',
  },
  {
    name: 'UPI',
    description: 'UPI is a payment service that allows you to accept payments for your expert sessions directly from your UPI account.',
    icon: '/upi.jpeg',
  },
]

export default function Integrations() {
  return (
    <div className="space-y-6 h-full overflow-auto p-4">
      <div>
        <h1 className="text-2xl text-slate-900 font-semibold">Integrations</h1>
        <p className="text-gray-600 mt-2">Connect your favorite tools to enhance your expert sessions.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.name} className="p-6 border rounded-lg hover:shadow-md transition-shadow bg-white">
            <div className="flex items-center space-x-4 mb-4">
              <img 
                src={integration.icon} 
                alt={integration.name} 
                className="w-12 h-12 object-contain" 
              />
              <div>
                <h2 className="text-lg font-semibold">{integration.name}</h2>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}