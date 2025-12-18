import React, { useState } from 'react';
import { Wrench, Battery, Smartphone, Clock, Shield, Award, Zap, CheckCircle } from 'lucide-react';
import { AppointmentModal } from './AppointmentModal';

export const RepairsView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const handleBookAppointment = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsModalOpen(true);
  };
  
  const services = [
    { 
      icon: Smartphone, 
      name: 'Screen Replacement', 
      price: '₹6,500+', 
      time: '1 Hour',
      description: 'Original quality display with warranty',
      gradient: 'from-blue-500 to-purple-600'
    },
    { 
      icon: Battery, 
      name: 'Battery Replacement', 
      price: '₹2,500+', 
      time: '30 Mins',
      description: 'High capacity genuine batteries',
      gradient: 'from-green-500 to-emerald-600'
    },
    { 
      icon: Wrench, 
      name: 'Water Damage', 
      price: 'Diagnosis Free', 
      time: '24 Hours',
      description: 'Complete diagnosis and repair',
      gradient: 'from-orange-500 to-red-500'
    },
  ];

  const features = [
    { icon: Shield, text: '6 Month Warranty' },
    { icon: Award, text: 'Certified Technicians' },
    { icon: Zap, text: 'Same Day Service' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Wrench className="h-4 w-4 mr-2" />
              Professional Repair Services
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Expert Repairs You Can
              <span className="block mt-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Trust & Rely On
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Fast, reliable, and warranty-backed repairs for all major brands by certified technicians.
            </p>
            
            {/* Features */}
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                  <feature.icon className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div 
              key={idx} 
              className="group bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${service.gradient}`} />
              <div className="p-8">
                <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform shadow-lg`}>
                  <service.icon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center">{service.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6">{service.description}</p>
                
                <div className="flex justify-center items-center space-x-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{service.time}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {service.price}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleBookAppointment(service.name)}
                  className={`w-full py-4 bg-gradient-to-r ${service.gradient} text-white rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Why Choose Us Section */}
        <div className="mt-20 bg-white dark:bg-slate-800 rounded-3xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Why Choose Our Repair Service?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Quick Turnaround', desc: 'Most repairs completed within hours' },
              { title: 'Quality Parts', desc: 'Original and certified components only' },
              { title: 'Expert Team', desc: 'Highly trained and certified technicians' },
              { title: 'Warranty', desc: '6-month warranty on all repairs' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceName={selectedService}
      />
    </div>
  );
};