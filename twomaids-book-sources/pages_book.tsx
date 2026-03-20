import camelcaseKeys from 'camelcase-keys';
import { withIronSession } from 'next-iron-session';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import Layout from '../components/Layout';
import OpenGraphDescription from '../components/OpenGraphDescription';
import OpenGraphTitle from '../components/OpenGraphTitle';
import Section from '../components/Section';
import { LeadProvider } from '../context/Lead';
import BookingBillingInfo from '../components/BookingBillingInfo';
import BookingHomeInfo from '../components/BookingHomeInfo';
import BookingStickyFooter from '../components/BookingStickyFooter';
import { FranchiseeProvider } from '../context/Franchisee';
import { FranchiseeState } from '../context/Franchisee/franchisee.types';
import axios, { AxiosResponse } from 'axios';
import { useIdleTimer } from 'react-idle-timer';
import { useDispatch, useSelector } from 'react-redux';
import db from '../SDKs/firebase/firebase';
import BookTopHero from '../components/BookTopHero';
import Head from '../components/head';
import franchiseeConfig from '../sessions/franchisee';
// import BookingOptSMS from '../components/BookingOptSMS';

export const getServerSideProps = withIronSession(async ({ req }) => {
  try {
    const franchiseeId = req.session.get('franchiseeId');

    if (!franchiseeId) {
      return {
        props: { franchisee: null },
      };
    }

    const locationsResponse = await axios
      .post('/api/get-locations', { ids: [franchiseeId] })
      .then(({ data }) => {
        // server side response isn't automatically parsing JSON.
        const responseData = JSON.parse(data);
        if (responseData.data?.length) {
          const currentFranchisee = camelcaseKeys(responseData.data[0]);
          return currentFranchisee;
        }
        return null;
      });

    return {
      props: {
        franchisee: locationsResponse,
      },
    };
  } catch (e) {
    return {
      props: {},
    };
  }
}, franchiseeConfig);

// dynamic imports
const BookingPackageSelection = dynamic(
  () => import('../components/BookingPackageSelection')
);

interface BookProps {
  franchisee?: FranchiseeState;
}

const Book: React.FC<BookProps> = ({ franchisee }: BookProps) => {
  const [bookingDisabled, setBookingDisabled] = useState<boolean>(true);
  const [packageDisabled, setPackageDisabled] = useState<boolean>(true);
  // const [hideSection, setHideSection] = useState<boolean>(true);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookingModalOrigin, setBookingModalOrigin] = useState<string>('');
  const [bookingModalZipCode, setBookingModalZipCode] = useState<string>('');
  // const [securityKey, setSecurityKey] = useState<number>();
  const [leadData, setLeadData] = useState<object>({});
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const dispatch = useDispatch();

  const enableBooking = () => {
    setBookingDisabled(false);
  };
  const enablePackage = () => {
    setPackageDisabled(false);
  };

  // const unHideSection = () => {
  //   setHideSection(false);
  // }

  const handleLeadData = (data: object) => {
    setLeadData(data);
  };

  const handleReturningCustomer = (customerData) => {
    if (customerData !== null) {
      setIsReturningCustomer(true);
      setCustomerInfo(customerData);
    } else {
      setIsReturningCustomer(false);
    }
  };

  const handleShowStorePicker = (flag) => {
    setShowBookingModal(flag);
    setBookingModalOrigin('book');
  };
  const handleBookingModalZipCode = (zipCode) => {
    setBookingModalZipCode(zipCode);
  };


  //dashboard idle detection
  const handleOnActive = () => {
    axios
      .get('/api/lead-session/')
      .then((res) => {
        if (!res.data.length) return;
        const lead = res.data.data.lead.id;
        const userStatusDatabaseRef = db.ref(`/online/${lead}`);
        userStatusDatabaseRef.update({
          leadID: lead,
        });
      })
      .catch((err) => console.log(err));
  };

  useIdleTimer({
    timeout: 1000,
    onActive: handleOnActive,
    debounce: 2000,
  });

  return (
    <FranchiseeProvider franchiseeValue={franchisee}>
      <LeadProvider>
        <Layout booking alternateFooter={true}>
          <Head
            slug='book'
            title='Book Professional Cleaning Services - Two Maids'
            description='Start your journey to a cleaner home with Two Maids. Simply book our professional cleaning services and let us handle the dirty work!'
          />
          <OpenGraphTitle title='Book Professional Cleaning Services - Two Maids' />
          <BookTopHero
            page={'book'}
            title={`Let's Get Started`}
            subheading={`Let Two Maids do all of the dirty work for you. Focus on everything else you need to get done and schedule a cleaning with us today.`}
          />

          <OpenGraphDescription>
            Start your journey to a cleaner home with Two Maids. Simply book our professional cleaning services and let us handle the dirty work!
          </OpenGraphDescription>
          <div className='top-background-dots'></div>

          <div className='booking-input-container'>
            <Section>
              <Row className='justify-content-center'>
                <Col xs={12} lg={10} xl={9}>
                  <BookingBillingInfo
                    enableBooking={enableBooking}
                    handleLeadData={handleLeadData}
                    onReturningCustomer={handleReturningCustomer}
                    // securityKey={securityKey}
                  />

                  {/* {!isReturningCustomer && <BookingOptSMS unHideSection={unHideSection} />} */}
                  <>
                    <BookingHomeInfo
                      bookingDisabled={bookingDisabled}
                      enablePackage={enablePackage}
                      isReturningCustomer={isReturningCustomer}
                      customerInfo={customerInfo}
                    />
                      <BookingPackageSelection 
                      packageDisabled={packageDisabled} 
                      isReturningCustomer={isReturningCustomer}
                    />
                  </>
                </Col>
              </Row>
            </Section>
          </div>
         <BookingStickyFooter />
        </Layout>
      </LeadProvider>
    </FranchiseeProvider>
  );
};
Book.defaultProps = {
  franchisee: null,
};

export default Book;
