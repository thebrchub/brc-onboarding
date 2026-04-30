import { useState, useEffect } from 'react';

export default function App() {
  const [formData, setFormData] = useState({
    email: '', name: '', accountHolderName: '', bankAccountNumber: '',
    bankName: '', ifscCode: '', upiId: ''
  });

  const [files, setFiles] = useState({ photo: null, aadhaar: null, pan: null });
  const [status, setStatus] = useState({ loading: false, message: '', isError: false });
  const [resetKey, setResetKey] = useState(Date.now());
  
  const [isDarkMode, setIsDarkMode] = useState(true);

  // ⚠️ PASTE YOUR GOOGLE WEB APP URL HERE ⚠️
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyig_ua0Qj_esEmbqRno8iSSzdrBI3taom9MMUVxhMMq7Pe0Iy7_hZ4tslrQGvPovTu/exec';

  useEffect(() => {
    const savedData = localStorage.getItem('brc_onboarding_data');
    if (savedData) {
      try { setFormData(JSON.parse(savedData)); } catch (e) { console.error("Error parsing saved data"); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('brc_onboarding_data', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
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
    setStatus({ loading: true, message: 'Encrypting & Uploading data...', isError: false });

    try {
      const photoBase64 = files.photo ? await convertToBase64(files.photo) : '';
      const aadhaarBase64 = files.aadhaar ? await convertToBase64(files.aadhaar) : '';
      const panBase64 = files.pan ? await convertToBase64(files.pan) : '';

      const payload = { ...formData, photoBase64, aadhaarBase64, panBase64 };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setStatus({ loading: false, message: 'Onboarding complete. Welcome to the team.', isError: false });
      setFormData({ email: '', name: '', accountHolderName: '', bankAccountNumber: '', bankName: '', ifscCode: '', upiId: '' });
      setFiles({ photo: null, aadhaar: null, pan: null });
      localStorage.removeItem('brc_onboarding_data');
      setResetKey(Date.now());
      
    } catch (error) {
      console.error(error);
      setStatus({ loading: false, message: 'System error. Please try again.', isError: true });
    }
  };

  // Shared Theme Toggle Component
  const ThemeToggle = () => (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="p-2.5 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 shadow-sm text-gray-600 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-500 transition-all shrink-0"
      aria-label="Toggle Theme"
    >
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
        
        {/* LEFT COLUMN: STATIC SIDEBAR (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col w-[380px] lg:fixed h-screen border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] relative overflow-hidden shrink-0 transition-colors duration-300 z-10">
          
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" 
              alt="Background" 
              className="w-full h-full object-cover opacity-10 dark:opacity-20 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/95 to-white dark:from-[#050505]/60 dark:via-[#050505]/80 dark:to-[#050505] transition-colors duration-300"></div>
          </div>

          <div className="relative z-10 p-10 flex flex-col h-full">
            <button onClick={handleLogoClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left mb-12">
              <img src="/logo.svg" alt="BRC HUB LLP Icon" className="h-10 w-auto" />
              <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white transition-colors">BRC <span className="text-orange-600 dark:text-orange-500 font-light">HUB LLP</span></span>
            </button>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Onboarding Progress</h2>
              <p className="text-gray-500 dark:text-neutral-400 text-xs">Complete the required fields to unlock the next section.</p>
            </div>

            <div className="flex-1 mt-2">
              <div className="flex flex-col">
                {steps.map((step, index) => {
                  const isActive = activeStep === step.num;
                  const isCompleted = activeStep > step.num;
                  
                  return (
                    <div key={step.num} className="flex">
                      <div className="flex flex-col items-center mr-5">
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4 ring-white dark:ring-[#0a0a0a] z-10
                          ${isActive ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 
                            isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-neutral-800 text-gray-500 dark:text-neutral-500'}`}
                        >
                          {isCompleted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                          ) : (
                            step.num
                          )}
                        </div>
                        {index !== steps.length - 1 && (
                          <div className="w-[2px] grow bg-gray-200 dark:bg-neutral-800/80 my-1 transition-colors"></div>
                        )}
                      </div>

                      <div className={`pb-10 transition-all duration-300 origin-left ${isActive ? 'scale-105' : ''} ${!isActive && !isCompleted ? 'opacity-40' : 'opacity-100'}`}>
                        <h4 className={`text-sm font-bold ${isActive ? 'text-orange-600 dark:text-orange-500' : 'text-gray-900 dark:text-white'}`}>{step.title}</h4>
                        <p className="text-gray-500 dark:text-neutral-400 text-xs mt-1">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
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

        {/* RIGHT COLUMN: MAIN CONTENT AREA (Seamless layout, no inner card) */}
        <div className="w-full lg:ml-[380px] flex flex-col p-6 sm:p-10 lg:p-16 min-h-screen transition-colors duration-300">
          
          <div className="max-w-3xl w-full mx-auto relative"> 
            
            {/* Header Area */}
            <div className="mb-10 border-b border-gray-200 dark:border-neutral-800 pb-8 transition-colors">
              
              {/* MOBILE TOP BAR (Logo + Toggle) */}
              <div className="flex justify-between items-center w-full mb-10 lg:hidden">
                <button onClick={handleLogoClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                   <img src="/logo.svg" alt="BRC HUB LLP Icon" className="h-8 w-auto" />
                   <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white transition-colors">BRC <span className="text-orange-600 dark:text-orange-500 font-light">HUB LLP</span></span>
                </button>
                <ThemeToggle />
              </div>

              {/* DESKTOP TOP BAR (Toggle Only, sits right above the heading) */}
              <div className="hidden lg:flex justify-end w-full mb-6 absolute -top-4 right-0">
                <ThemeToggle />
              </div>

              <h1 className="text-4xl md:text-5xl font-black mb-5 tracking-tighter text-gray-900 dark:text-white transition-colors">
                Welcome to the team.
              </h1>
              <p className="text-gray-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed bg-white dark:bg-[#111] p-5 rounded-xl border border-gray-200 dark:border-neutral-800 border-l-4 border-l-orange-500 shadow-sm transition-colors">
                Please fill in your basic personal information, bank details, and identification document to complete the onboarding process. This helps us ensure smooth communication and timely monthly payments. Only essential information is collected.
              </p>
            </div>

            {status.message && (
              <div className={`p-4 mb-8 rounded-lg border ${status.isError ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-600 dark:text-green-400'}`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10 pb-4">
              
              {/* Step 1: Personal Details */}
              <div className={`space-y-5 transition-opacity duration-300 ${activeStep >= 1 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="flex items-center gap-3 border-b border-gray-200 dark:border-neutral-800 pb-2 mb-4">
                   <span className="bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors">1</span>
                   <h3 className="text-lg text-gray-900 dark:text-white font-bold tracking-wide transition-colors">Personal Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1.5">Email Address *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} 
                      className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-gray-400 dark:placeholder-neutral-700 shadow-sm" placeholder="hello@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1.5">Full Name *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} 
                      className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-gray-400 dark:placeholder-neutral-700 shadow-sm" placeholder="As per records" />
                  </div>
                </div>
              </div>

              {/* Step 2: Bank Details */}
              <div className={`space-y-5 transition-opacity duration-300 ${activeStep >= 2 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className="flex items-center gap-3 border-b border-gray-200 dark:border-neutral-800 pb-2 mb-4 mt-6">
                   <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${activeStep >= 2 ? 'bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500' : 'bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'}`}>2</span>
                   <h3 className="text-lg text-gray-900 dark:text-white font-bold tracking-wide transition-colors">Payment Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white dark:bg-[#111] p-5 sm:p-6 lg:p-8 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm transition-colors">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1.5">Account Holder Name *</label>
                    <input required type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleInputChange} 
                      className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1.5">Bank Account Number *</label>
                    <input required type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleInputChange} 
                      className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1.5">Bank Name *</label>
                    <input required type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} 
                      className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1.5">IFSC Code *</label>
                    <input required type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} 
                      className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all uppercase" />
                  </div>
                  <div className="md:col-span-2 pt-1">
                    <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1.5">UPI ID *</label>
                    <input required type="text" name="upiId" value={formData.upiId} onChange={handleInputChange} 
                      className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" placeholder="username@upi" />
                  </div>
                </div>
              </div>

              {/* Step 3: Document Uploads */}
              <div key={resetKey} className={`space-y-5 transition-opacity duration-300 ${activeStep >= 3 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className="flex items-center gap-3 border-b border-gray-200 dark:border-neutral-800 pb-2 mb-4 mt-6">
                   <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${activeStep >= 3 ? 'bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500' : 'bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'}`}>3</span>
                   <h3 className="text-lg text-gray-900 dark:text-white font-bold tracking-wide transition-colors">Required Documents</h3>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                   <div className="group">
                    <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1.5 group-hover:text-orange-500 transition-colors">Passport Photo *</label>
                    <input required type="file" name="photo" accept="image/*" onChange={handleFileChange} 
                      className="w-full text-sm text-gray-600 dark:text-neutral-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gray-100 dark:file:bg-[#1a1a1a] file:text-orange-600 dark:file:text-orange-500 hover:file:bg-gray-200 dark:hover:file:bg-[#222] file:transition-all cursor-pointer border border-dashed border-gray-300 dark:border-neutral-800 hover:border-orange-500/50 rounded-xl p-1.5 bg-white dark:bg-[#111] transition-all" />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1.5 group-hover:text-orange-500 transition-colors">Aadhaar Card *</label>
                    <input required type="file" name="aadhaar" accept="image/*,.pdf" onChange={handleFileChange} 
                      className="w-full text-sm text-gray-600 dark:text-neutral-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gray-100 dark:file:bg-[#1a1a1a] file:text-orange-600 dark:file:text-orange-500 hover:file:bg-gray-200 dark:hover:file:bg-[#222] file:transition-all cursor-pointer border border-dashed border-gray-300 dark:border-neutral-800 hover:border-orange-500/50 rounded-xl p-1.5 bg-white dark:bg-[#111] transition-all" />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-600 dark:text-neutral-400 mb-1.5 group-hover:text-orange-500 transition-colors">Pan Card *</label>
                    <input required type="file" name="pan" accept="image/*,.pdf" onChange={handleFileChange} 
                      className="w-full text-sm text-gray-600 dark:text-neutral-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gray-100 dark:file:bg-[#1a1a1a] file:text-orange-600 dark:file:text-orange-500 hover:file:bg-gray-200 dark:hover:file:bg-[#222] file:transition-all cursor-pointer border border-dashed border-gray-300 dark:border-neutral-800 hover:border-orange-500/50 rounded-xl p-1.5 bg-white dark:bg-[#111] transition-all" />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-8 border-t border-gray-200 dark:border-neutral-800 transition-colors">
                <button 
                  type="submit" 
                  disabled={status.loading || !isReadyToSubmit}
                  className={`w-full font-extrabold py-4 px-6 rounded-xl transition-all duration-300 flex justify-center items-center gap-2
                    ${isReadyToSubmit 
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-[0_4px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_4px_30px_rgba(234,88,12,0.5)] hover:from-orange-500 hover:to-orange-400 cursor-pointer' 
                      : 'bg-gray-200 dark:bg-[#111] text-gray-400 dark:text-neutral-600 border border-transparent dark:border-neutral-800 cursor-not-allowed'
                    }`}
                >
                  {status.loading ? 'Encrypting & Sending...' : (
                    <>
                      Complete Onboarding
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
                    </>
                  )}
                </button>
              </div>
              
            </form>
          </div>
        </div>
      </div>
    </>
  );
}