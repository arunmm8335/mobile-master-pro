import React from 'react';
import { Phone, MapPin, Mail, Instagram, MessageCircle, Clock, Send } from 'lucide-react';

export const ContactView: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-6">
            <MessageCircle className="h-4 w-4" />
            We're Here to Help
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6">Get in Touch</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Have a question? Need support? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left Column: Contact Cards */}
          <div className="space-y-8">
            
            {/* Quick Contact Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href="https://wa.me/917026584127" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative overflow-hidden flex items-center justify-center p-6 bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <svg viewBox="0 0 24 24" className="h-7 w-7 mr-3 fill-current relative z-10" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="font-bold text-lg relative z-10">WhatsApp</span>
              </a>
              
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative overflow-hidden flex items-center justify-center p-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <Instagram className="h-7 w-7 mr-3 relative z-10" />
                <span className="font-bold text-lg relative z-10">Instagram</span>
              </a>
            </div>

            {/* Contact Details Cards */}
            <div className="space-y-6">
              
              {/* Location Card */}
              <div className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start space-x-5">
                  <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Visit Our Store</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      123, 100 Feet Road, Indiranagar<br />
                      Bangalore, Karnataka 560038
                    </p>
                    <a 
                      href="https://maps.app.goo.gl/6GhPNocFqfBiPTSB6?g_st=am" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:gap-3 transition-all"
                    >
                      Get Directions 
                      <Send className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start space-x-5">
                  <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Call Support</h3>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-3">
                      <Clock className="h-4 w-4" />
                      <span>Mon-Sun: 10am - 9pm</span>
                    </div>
                    <a 
                      href="tel:+917026584127" 
                      className="text-2xl font-bold text-slate-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      +91 70265 84127
                    </a>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start space-x-5">
                  <div className="flex-shrink-0 bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Email Us</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                      For bulk orders & inquiries
                    </p>
                    <a 
                      href="mailto:wowbazaar99@gmail.com" 
                      className="text-lg font-medium text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors break-all"
                    >
                      wowbazaar99@gmail.com
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Map */}
          <div className="h-full">
            <div className="h-full bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.8874474926745!2d72.8348288!3d19.0196593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce7c65555555%3A0x0!2zMTnCsDAxJzEwLjgiTiA3MsKwNTAnMDUuNCJF!5e0!3m2!1sen!2sin!4v1234567890" 
                width="100%" 
                height="100%" 
                style={{ border: 0, minHeight: '100%', position: 'absolute', top: 0, left: 0 }} 
                allowFullScreen={true} 
                loading="lazy"
                title="Shop Location"
                className="filter grayscale-[0.3] hover:grayscale-0 transition-all duration-500"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};