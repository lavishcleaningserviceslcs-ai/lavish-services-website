import React, {useEffect, useRef} from 'react';
import { useRouter } from 'next/router';
import { useFranchiseeContext } from '../../context/Franchisee';

interface CustomerInfo {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  people: any;
  pets: any;
  bedrooms: any;
  bathrooms: any;
  square_footage: any;
  address_line_one: string;
  address_line_two: string;
  state: string;
  city: string;
  zip_code: string;
}

interface WelcomeBackComponentProps {
  customerInfo: CustomerInfo | null;
}




const WelcomeBackComponent: React.FC<WelcomeBackComponentProps> = ({ customerInfo }) => {

    const { franchisee } = useFranchiseeContext();  
    const router = useRouter();
    const anchorRef = useRef(null);
    
    useEffect(() => {
        const timeoutId = setTimeout(() => {
          if (anchorRef.current) {
            const elementRect = anchorRef.current.getBoundingClientRect();
            const offsetTop = window.scrollY + elementRect.top - 160;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth',
            });
          }
        }, 300);
      
        return () => clearTimeout(timeoutId);
      }, []);

    return (
        <div ref={anchorRef} className='returning-customer-welcome-container'>
        <h2 className='form-section-header welcome-back-greeting-heading'>{customerInfo?.first_name}, welcome back to Two Maids <span className='welcome-back-greeting-store'>{franchisee.name}!</span></h2>
        {customerInfo && (
            <>
                <div>
                <p className='welcome-back-address'>{customerInfo?.address_line_one} {customerInfo?.address_line_two} {customerInfo?.city}, {customerInfo?.state} {customerInfo?.zip_code}</p>
                </div>
                <div>
                    <i style={{display: 'block', marginBottom: '.5rem'}}>Different address?</i>
                    <button 
                        className='btn btn-primary' 
                        onClick={() => {
                            router.push({pathname: '/customer-thank-you/'});
                        }}
                    >Change Address</button>
                </div>
            </>
        )}
        </div>
    );
};

export default WelcomeBackComponent;