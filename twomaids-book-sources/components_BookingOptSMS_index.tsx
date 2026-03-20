import React, { useState, useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import leadSMSOptIn, { LeadSMSOptInData } from '../../SDKs/Gataware/partial/leadSMSOptIn';
import { useLeadContext } from '../../context/Lead';

interface BookingOptSMSProps {}

const BookingOptSMS: React.FC<BookingOptSMSProps> = () => {
    const [transactionSMS, setTransactionSMS] = useState(true);
    const [promotionSMS, setPromotionSMS] = useState(false);

    const { lead } = useLeadContext();
    const previousPromotionSMS = useRef(promotionSMS);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedPromotionSMS = sessionStorage.getItem('promotionSMS');
            if (storedPromotionSMS !== null) {
                setPromotionSMS(storedPromotionSMS === 'true');
            }
        }
    }, []);

    const handlePromotionCheckboxChange = (event) => {
        const isChecked = event.target.checked;
        setPromotionSMS(isChecked);

        if (typeof window !== 'undefined') {
            sessionStorage.setItem('promotionSMS', isChecked.toString());
        }
    };

    const optInSMS = async () => {
        const requestData = {
            leadId: lead.id,
            transactionSMS: transactionSMS,
            promotionSMS: promotionSMS,
        };

        if (promotionSMS !== previousPromotionSMS.current) {
            try {
                await axios.post('/api/lead-sms-opt-in/', requestData);
            } catch (error) {
                console.error('Error opting in SMS:', error);
            }
        }
    };

    useEffect(() => {
        optInSMS();
        previousPromotionSMS.current = promotionSMS;
    }, [promotionSMS]);

    return (
        <>
            <div className='mt-4 mb-4 d-flex text-justify booking-terms-disclaimer'>
                <Form.Check
                    aria-label='Agree to use SMS text messages for special offers and promotional communications'
                    className='pr-3 confirm-checkbox'
                    name='promotionSMS'
                    checked={promotionSMS}
                    onChange={handlePromotionCheckboxChange}
                />
                <p style={{ fontSize: '14px' }}>
                    I agree to receive periodic promotional and marketing SMS (text) messages from Two Maids Cleaning. 
                    You can reply STOP to opt out at any time or text HELP for assistance. Message & data rates may apply. 
                    Messaging frequency may vary. Please review our <a href='/privacy-policy' target='_blank'>Privacy Policy</a>.{' '}
                </p>
            </div>
            <hr />
        </>
    );
};

export default BookingOptSMS;