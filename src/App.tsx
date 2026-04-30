import { useState, useEffect } from 'react';

// Refined, punchy testimonials for maximum impact
const testimonials = [
  {
    text: "The AI analyzer they built revolutionized our tax order processing. It turns hours of manual reading into seconds, saving us hundreds of man-hours.",
    author: "Sanket Joshi",
    role: "Principal CA, Sanket Milind Joshi & Co."
  },
  {
    text: "They didn't just build a site, they built a lead generation machine. Fast, professional, and our search visibility has dramatically improved.",
    author: "Himanshu Agrawal",
    role: "Director, LVC LegalVala"
  },
  {
    text: "The graphic design output from BRC Hub is consistently top-tier. Their ability to translate complex ideas into visually striking brand assets has been invaluable.",
    author: "Javeed",
    role: "Graphic Designer, Ballari"
  },
  {
    text: "Delivered our Quantacel product site in record time without compromising quality. An incredibly fast and reliable technology partner.",
    author: "Director",
    role: "Orvexa Softech Pvt Ltd"
  },
  {
    text: "Their attention to detail and robust development completely elevated our online presence. A brilliant team to work with.",
    author: "Arun",
    role: "Powerbird Elevators, Sirsi"
  }
];

export default function App() {
  const [formData, setFormData] = useState({
    email: '', name: '', accountHolderName: '', bankAccountNumber: '',
    bankName: '', ifscCode: '', upiId: ''
  });

  const [files, setFiles] = useState({ photo: null, aadhaar: null, pan: null });
  const [status, setStatus] = useState({ loading: false, message: '', isError: false });
  const [resetKey, setResetKey] = useState(Date.now());
  
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('brc_onboarding_data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.theme === 'light') return false; 
        } catch (e) { console.error("Theme parse error"); }
      }
    }
    return true; 
  });

  // ⚠️ GOOGLE WEB APP URL ⚠️
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyig_ua0Qj_esEmbqRno8iSSzdrBI3taom9MMUVxhMMq7Pe0Iy7_hZ4tslrQGvPovTu/exec';

  useEffect(() => {
    const savedData = localStorage.getItem('brc_onboarding_data');
    if (savedData) {
      try { 
        const parsed = JSON.parse(savedData);
        setFormData({
          email: parsed.email || '', name: parsed.name || '', 
          accountHolderName: parsed.accountHolderName || '', bankAccountNumber: parsed.bankAccountNumber || '',
          bankName: parsed.bankName || '', ifscCode: parsed.ifscCode || '', upiId: parsed.upiId || ''
        });
      } catch (e) { console.error("Error parsing saved data"); }
    }
  }, []);

  useEffect(() => {
    const dataToSave = { ...formData, theme: isDarkMode ? 'dark' : 'light' };
    localStorage.setItem('brc_onboarding_data', JSON.stringify(dataToSave));
  }, [formData, isDarkMode]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  // Testimonial Carousel Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: any) => {
    let { name, value } = e.target;
    if (name === 'bankAccountNumber') value = value.replace(/\D/g, ''); 
    if (name === 'ifscCode') value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11); 
    if (name === 'name' || name === 'accountHolderName' || name === 'bankName') value = value.replace(/[^a-zA-Z\s]/g, ''); 
    if (name === 'upiId') value = value.toLowerCase().replace(/[^a-z0-9.\-_@]/g, ''); 
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setStatus({ loading: false, message: `The file "${file.name}" exceeds the 10MB limit.`, isError: true });
        e.target.value = null; 
        return;
      }
      if (status.isError) setStatus({ loading: false, message: '', isError: false });
      setFiles({ ...files, [e.target.name]: file });
    }
  };

  const handleLogoClick = () => {
    if (window.confirm("You are about to leave the onboarding portal. Your text progress is saved locally. Continue to the website?")) {
      window.location.href = 'https://www.brchub.tech';
    }
  };

  const isStep1Done = formData.email.trim() !== '' && formData.name.trim() !== '';
  const isStep2Done = isStep1Done && formData.accountHolderName.trim() !== '' && formData.bankAccountNumber.trim() !== '' && formData.bankName.trim() !== '' && formData.ifscCode.trim() !== '' && formData.upiId.trim() !== '';
  const isStep3Done = isStep2Done && files.photo !== null && files.aadhaar !== null && files.pan !== null;

  let activeStep = 1;
  if (isStep1Done) activeStep = 2;
  if (isStep2Done) activeStep = 3;
  if (isStep3Done) activeStep = 4;

  const isReadyToSubmit = activeStep === 4;

  const steps = [
    { num: 1, title: 'Personal Details', desc: 'Basic contact info' },
    { num: 2, title: 'Payment Details', desc: 'Bank & UPI routing' },
    { num: 3, title: 'Documentation', desc: 'ID & Photo uploads' },
  ];

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const upiRegex = /^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$/;
    
    // Strict Javascript validations that run when clicking Submit
    if (formData.bankAccountNumber.length < 9 || formData.bankAccountNumber.length > 18) {
      setStatus({ loading: false, message: 'Bank Account Number must be between 9 and 18 digits.', isError: true });
      return;
    }
    if (!ifscRegex.test(formData.ifscCode)) {
      setStatus({ loading: false, message: 'Invalid IFSC Code format. It should be 11 characters (e.g., SBIN0001234).', isError: true });
      return;
    }
    if (!upiRegex.test(formData.upiId)) {
      setStatus({ loading: false, message: 'Invalid UPI ID format (e.g., username@bank).', isError: true });
      return;
    }
    
    setStatus({ loading: true, message: '', isError: false });
    
    try {
      const payload = { 
        ...formData, 
        photoBase64: files.photo ? await convertToBase64(files.photo) : '',
        aadhaarBase64: files.aadhaar ? await convertToBase64(files.aadhaar) : '',
        panBase64: files.pan ? await convertToBase64(files.pan) : ''
      };
      await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
      setStatus({ loading: false, message: 'Onboarding complete. Welcome to the team.', isError: false });
      setFormData({ email: '', name: '', accountHolderName: '', bankAccountNumber: '', bankName: '', ifscCode: '', upiId: '' });
      setFiles({ photo: null, aadhaar: null, pan: null });
      localStorage.removeItem('brc_onboarding_data');
      setResetKey(Date.now());
    } catch (error) { setStatus({ loading: false, message: 'System error.', isError: true }); }
  };

  const ThemeToggle = () => (
    <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 shadow-sm text-gray-600 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-500 transition-all shrink-0">
      {isDarkMode ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-2.25l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
      )}
    </button>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white flex flex-col lg:flex-row font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300">
        
        {/* FIRST SPLIT: SIDEBAR */}
        <div className="hidden lg:flex flex-col w-[380px] lg:fixed h-screen border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] relative overflow-hidden shrink-0 transition-colors duration-300 z-10">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" alt="Background" className="w-full h-full object-cover opacity-10 dark:opacity-20 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/95 to-white dark:from-[#050505]/60 dark:via-[#050505]/80 dark:to-[#050505] transition-colors duration-300"></div>
          </div>
          <div className="relative z-10 p-10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-12">
                <button onClick={handleLogoClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left">
                <img src="/logo.svg" alt="BRC Hub Icon" className="h-10 w-auto" />
                <span className="text-2xl font-extrabold tracking-tight">BRC <span className="text-orange-600 dark:text-orange-500 font-light">HUB</span></span>
                </button>
                <ThemeToggle />
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">Onboarding Progress</h2>
              <p className="text-gray-500 dark:text-neutral-400 text-xs">Complete the required fields to unlock the next section.</p>
            </div>
            <div className="flex-1 mt-2">
              <div className="flex flex-col">
                {steps.map((step, index) => (
                  <div key={step.num} className="flex">
                    <div className="flex flex-col items-center mr-5">
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4 ring-white dark:ring-[#0a0a0a] z-10 ${activeStep === step.num ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' : activeStep > step.num ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-neutral-800 text-gray-500 dark:text-neutral-500'}`}>
                        {activeStep > step.num ? '✓' : step.num}
                      </div>
                      {index !== steps.length - 1 && <div className="w-[2px] grow bg-gray-200 dark:bg-neutral-800/80 my-1 transition-colors"></div>}
                    </div>
                    <div className={`pb-10 transition-all duration-300 origin-left ${activeStep === step.num ? 'scale-105' : activeStep < step.num ? 'opacity-40' : 'opacity-100'}`}>
                      <h4 className={`text-sm font-bold ${activeStep === step.num ? 'text-orange-600 dark:text-orange-500' : 'text-gray-900 dark:text-white'}`}>{step.title}</h4>
                      <p className="text-gray-500 dark:text-neutral-400 text-xs mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-6 border-t border-gray-200 dark:border-neutral-800 mt-auto transition-colors">
               <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
                  <div className={`w-2 h-2 rounded-full ${isReadyToSubmit ? 'bg-green-500 animate-pulse' : 'bg-orange-500 animate-pulse'}`}></div>
                  {isReadyToSubmit ? 'Ready to submit' : 'Awaiting input...'}
               </div>
            </div>
          </div>
        </div>

        {/* SECOND SPLIT: FORM (Scrollable Area) */}
        <div className="w-full lg:ml-[380px] xl:mr-[400px] flex flex-col min-h-screen transition-colors duration-300">
          <div className="flex-1 flex flex-col p-6 sm:p-10 lg:p-16 max-w-4xl mx-auto lg:mx-0">
            <div className="max-w-3xl w-full mx-auto relative"> 
              <div className="mb-10 border-b border-gray-200 dark:border-neutral-800 pb-8 transition-colors">
                {/* Mobile Header (No Toggle) */}
                <div className="flex justify-between items-center w-full mb-10 lg:hidden">
                  <button onClick={handleLogoClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                     <img src="/logo.svg" alt="BRC Hub Icon" className="h-8 w-auto" />
                     <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white transition-colors">BRC <span className="text-orange-600 dark:text-orange-500 font-light">HUB</span></span>
                  </button>
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-5 tracking-tighter">Welcome to the team.</h1>
                <p className="text-gray-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed bg-white dark:bg-[#111] p-5 rounded-xl border border-gray-200 dark:border-neutral-800 border-l-4 border-l-orange-500 shadow-sm transition-colors">
                  Please provide your details below. This information is required to ensure your secure registration and timely commission payouts.
                </p>
              </div>

              {/* Status loading text moved to top so they know it's working */}
              {status.loading && (
                <div className="p-4 mb-8 rounded-lg border bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 flex items-start sm:items-center gap-3 shadow-sm">
                  <span className="text-sm">Submitting your details securely. Please wait a minute and <strong>do not refresh the page!</strong></span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-10 pb-4">
                <div className={`space-y-5 transition-opacity duration-300 ${activeStep >= 1 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <div className="flex items-center gap-3 border-b border-gray-200 dark:border-neutral-800 pb-2 mb-4">
                     <span className="bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors">1</span>
                     <h3 className="text-lg text-gray-900 dark:text-white font-bold tracking-wide transition-colors">Personal Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm" placeholder="Email Address *" />
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm" placeholder="Full Name *" />
                  </div>
                </div>

                <div className={`space-y-5 transition-opacity duration-300 ${activeStep >= 2 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                  <div className="flex items-center gap-3 border-b border-gray-200 dark:border-neutral-800 pb-2 mb-4 mt-6">
                     <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${activeStep >= 2 ? 'bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500' : 'bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'}`}>2</span>
                     <h3 className="text-lg text-gray-900 dark:text-white font-bold tracking-wide transition-colors">Payment Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white dark:bg-[#111] p-5 sm:p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm transition-colors">
                    {/* RESTORED HTML5 VALIDATION ATTRIBUTES */}
                    <input required type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5" placeholder="Account Holder Name *" />
                    <input required type="text" minLength={9} maxLength={18} name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5" placeholder="Bank Account Number *" />
                    <input required type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5" placeholder="Bank Name *" />
                    <input required type="text" minLength={11} maxLength={11} name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 uppercase" placeholder="IFSC Code *" />
                    <input required type="text" name="upiId" value={formData.upiId} onChange={handleInputChange} className="md:col-span-2 w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5" placeholder="UPI ID * (e.g. username@upi)" />
                  </div>
                </div>

                <div key={resetKey} className={`space-y-5 transition-opacity duration-300 ${activeStep >= 3 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                  <div className="flex items-center gap-3 border-b border-gray-200 dark:border-neutral-800 pb-2 mb-4 mt-6">
                     <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${activeStep >= 3 ? 'bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500' : 'bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'}`}>3</span>
                     <h3 className="text-lg text-gray-900 dark:text-white font-bold tracking-wide transition-colors">Required Documents</h3>
                  </div>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {['photo', 'aadhaar', 'pan'].map((type) => (
                      <div key={type} className="group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{type} *</label>
                        <input required type="file" name={type} onChange={handleFileChange} className="w-full text-xs file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-100 dark:file:bg-[#1a1a1a] file:text-orange-600 dark:file:text-orange-500 hover:file:bg-gray-200 dark:hover:file:bg-[#222] border border-dashed border-gray-300 dark:border-neutral-800 hover:border-orange-500/50 rounded-xl p-1.5 bg-white dark:bg-[#111] transition-all cursor-pointer" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ERROR MESSAGE MOVED DOWN HERE: Right above the button so they see it! */}
                {!status.loading && status.message && (
                  <div className={`p-4 mt-8 rounded-xl border text-sm font-medium ${status.isError ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-600 dark:text-green-400'}`}>
                    {status.message}
                  </div>
                )}

                <div className="pt-6 mt-4 border-t border-gray-200 dark:border-neutral-800 transition-colors">
                  <button type="submit" disabled={status.loading || !isReadyToSubmit} className={`w-full font-extrabold py-4 px-6 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 ${isReadyToSubmit && !status.loading ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_4px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_4px_30px_rgba(234,88,12,0.5)] cursor-pointer' : 'bg-gray-200 dark:bg-[#111] text-gray-400 dark:text-neutral-600 border border-transparent dark:border-neutral-800 cursor-not-allowed'}`}>
                    {status.loading ? 'Processing...' : 'Complete Onboarding'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* THIRD SPLIT: CONTENT PANEL (Locked Static with Organic Content & Carousel) */}
        <div className="hidden xl:flex flex-col w-[400px] fixed top-0 right-0 h-screen border-l border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 z-10">
            <div className="p-10 flex flex-col h-full">
              
              {/* BRC's Vision Section */}
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white uppercase tracking-tight">BRC's Vision</h2>
                <div className="relative">
                  <p className="text-sm italic text-gray-600 dark:text-neutral-400 leading-relaxed pl-4 border-l-2 border-orange-500">
                    "To build digital experiences that feel intuitive and perform flawlessly. We focus on blending clean design with solid engineering so our clients can focus on what they do best—growing their business."
                  </p>
                </div>
              </div>

              {/* FIXED Fading Testimonial Carousel using CSS Grid */}
              <div className="mb-10 flex-1 relative flex flex-col">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white uppercase tracking-tight">Client Impact</h2>
                
                {/* CSS Grid replaces absolute positioning so it auto-sizes to the tallest card */}
                <div className="grid w-full">
                  {testimonials.map((test, i) => (
                    <div 
                      key={i} 
                      className={`col-start-1 row-start-1 w-full transition-opacity duration-1000 ease-in-out ${testimonialIndex === i ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}
                    >
                      <div className="p-6 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm h-full flex flex-col justify-center">
                        <p className="text-sm leading-relaxed mb-4 text-gray-600 dark:text-neutral-300">"{test.text}"</p>
                        <div className="flex flex-col mt-auto">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">{test.author}</span>
                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-1">{test.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Carousel Dots indicator */}
                <div className="flex gap-2 justify-center mt-6">
                  {testimonials.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setTestimonialIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${testimonialIndex === i ? 'bg-orange-600 w-4' : 'bg-gray-300 dark:bg-neutral-700 hover:bg-orange-300'}`}
                      aria-label={`Go to testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Mission Badge */}
              <div className="mt-auto p-8 rounded-3xl bg-gradient-to-br from-orange-600 to-orange-500 text-white shadow-xl shadow-orange-600/20 shrink-0">
                 <h4 className="font-bold text-xl mb-2">Our Mission</h4>
                 <p className="text-sm opacity-90 leading-normal mb-6">Helping brands communicate clearly and grow efficiently through honest, high-quality digital solutions.</p>
                 <div className="pt-4 border-t border-white/20 text-[10px] font-black tracking-widest uppercase flex justify-between items-center">
                   <span>BRC HUB LLP</span>
                   <span>🇮🇳</span>
                 </div>
              </div>

            </div>
          </div>
          
      </div>
    </>
  );
}