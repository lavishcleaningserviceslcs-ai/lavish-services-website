import axios, { AxiosResponse } from 'axios';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Button,
  Col,
  Form,
  ListGroup,
  Modal,
  Row,
  Toast,
} from 'react-bootstrap';
import 'react-bootstrap/Col';
import 'react-bootstrap/Form';
import { useDebouncedCallback } from 'use-debounce';
import Section from '../../components/Section';
import ReturningCustomerWelcome from '../ReturningCustomerWelcome';
import SyncLoader from 'react-spinners/SyncLoader';
import 'cleave.js/dist/addons/cleave-phone.us';
import NumberFormat from 'react-number-format';
import { datadogRum } from '@datadog/browser-rum';
import * as Sentry from '@sentry/node';
import { DateTime } from 'luxon';
import { RichText } from 'prismic-reactjs';
import { useDispatch, useSelector } from 'react-redux';
import billingInfo, {
  BillingInfoData,
} from '../../SDKs/Gataware/partial/billingInfo';
import htmlSerializer from '../../SDKs/Prismic/htmlSerializer';
import { PrismicClient } from '../../SDKs/Prismic/prismic.config';
import db from '../../SDKs/firebase/firebase';
import { REPLACE, useFranchiseeContext } from '../../context/Franchisee';
import { BILLING_INFO, CLEAR, useLeadContext } from '../../context/Lead';
import { pink500 } from '../../ui/colors';
import { validateEmail, validatePhone } from '../../utils/stringValidation';
import { MemoizedBookingStorePicker } from '../BookingStorePicker';
import ToastWrapper from '../ToastWrapper';
import BookingOptSMS from '../BookingOptSMS';
import { useRouter } from 'next/router';

interface BookingBillingInfoProps {
  enableBooking?: any;
  handleLeadData?: any;
  bookingModalZipCode?: any;
  handleBookingModalZipCode?: any;
  onReturningCustomer?: any;
  // securityKey?: number;
}
const BookingBillingInfo: React.FC<BookingBillingInfoProps> = ({
  enableBooking,
  handleLeadData,
  bookingModalZipCode,
  handleBookingModalZipCode,
  onReturningCustomer,
}: // securityKey,
BookingBillingInfoProps) => {
  const { franchisee } = useFranchiseeContext();
  const franchiseeId = franchisee.id;
  const franchiseeName = franchisee.name;

  const { lead, dispatchLead } = useLeadContext();

  /* Form Fields */
  const [firstName, setFirstName] = useState<string>(lead?.firstName ?? '');
  const [lastName, setLastName] = useState<string>(lead?.lastName ?? '');
  const [email, setEmail] = useState<string>(lead?.email ?? '');
  const [phonePrimary, setPhoneNumber] = useState<string>(
    lead?.phonePrimary ?? ''
  );
  const [disabled, setDisabled] = useState<boolean>(false);
  const [domainRef, setDomainRef] = useState<string>('');
  const [tacData, setTacData] = useState<any>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [userZipCode, setUserZipCode] = useState<string>('');
  const [searchZipCode, setSearchZipCode] = useState<string>('');
  const [emailsIsValid, setEmailIsValid] = useState<boolean>(false);
  const [emailToastText, setEmailToastText] = useState<string>('');
  const [zipInputValue, setZipInputValue] = useState<string | string[]>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [emailToast, setEmailToast] = useState<boolean>(false);
  const [firstNameToast, setFirstNameToast] = useState<boolean>(false);
  const [lastNameToast, setLastNameToast] = useState<boolean>(false);
  const [phoneToast, setPhoneToast] = useState<boolean>(false);
  const [leadToast, setLeadToast] = useState<boolean>(false);
  const [showStorePicker, setShowStorePicker] = useState<boolean>(false);
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipDisabled, setZipDisabled] = useState<boolean>(false);
  const router = useRouter();

  const handleShowStorePicker = (zipCode = '') => {
    if (zipCode.length === 5) {
      setZipInputValue(zipCode);
    }
    setShowStorePicker(false);
  };

  const [sentLeadNotification, setSentLeadNotification] =
    useState<boolean>(false);
  const [cookieExists, setCookieExists] = useState<boolean>(false);

  // const count = useSelector((state: RootState) => state.counter.value)
  const { dispatchFranchisee } = useFranchiseeContext();

  const dispatch = useDispatch();

  useEffect(() => {
    if (window.document) {
      if (window.document.referrer === '') {
        setDomainRef(
          `${window.document.URL}${franchisee.slug}/`.replace('/book', '')
        );
      } else {
        setDomainRef(window.document.referrer);
      }
    }
  });

  /* populate the form fields */
  const syncLead = useCallback(() => {
    if (!lead) {
      return;
    }

    if (lead.firstName) {
      setFirstName(lead.firstName);
    }

    if (lead?.lastName) {
      setLastName(lead.lastName);
    }

    if (lead.email) {
      setEmail(lead.email);
    }

    if (lead.phonePrimary) {
      setPhoneNumber(lead.phonePrimary);
    }

    if (lead.zipCode) {
      setZipInputValue(lead.zipCode);
    }
  }, [lead]);

  useEffect(syncLead, [lead]);

  const checkFirstName = useDebouncedCallback(
    () => {
      if (firstName.replace(/\s+/, '').length < 2) {
        setFirstNameToast(true);
      }
    },
    1000,
    { trailing: true }
  );

  const checkLastName = useDebouncedCallback(
    () => {
      if (lastName.replace(/\s+/, '').length < 2) {
        setLastNameToast(true);
      }
    },
    1000,
    { trailing: true }
  );
  const checkEmail = useDebouncedCallback(
    () => {
      if (!validateEmail(email)) {
        setEmailToast(true);
        return false;
      }
      setEmailIsValid(true);
      return true;
    },
    1200,
    { trailing: true }
  );

  const checkPhonePrimary = useDebouncedCallback(
    () => {
      if (!validatePhone(phonePrimary.replace('-', ' '))) {
        setPhoneToast(true);
      }
    },
    1000,
    { trailing: true }
  );

  // check if all fields are ready to submit;
  const allFieldsAreValid = () =>
    validateEmail(email) &&
    validatePhone(phonePrimary.replace('-', '')) &&
    firstName.replace(/\s+/, '').length >= 2 &&
    lastName.replace(/\s+/, '').length >= 2 &&
    checkEmail &&
    zipInputValue !== undefined &&
    zipInputValue !== '' &&
    zipInputValue.length === 5;

  // const handleNoFranchiseSelected = () => {
  //   handleShowStorePicker(true);
  // };

  useEffect(() => {
    axios
      .get('/api/lead-session/')
      .then((res) => {
        // console.log('lead-session', res);
        if (res.data === '') {
          setCookieExists(true);
        } else {
          setSentLeadNotification(true);
        }
      })
      .catch((err) => console.log(err));
    // console.log(cookieExists);
  }, []);

  // Check if the customer exists
  const checkIfEmailExists = useDebouncedCallback(
    async () => {
      try {
        const emailCheck = await axios.post('/api/check-if-customer-exists/', {
          email,
        });
        console.log('In the email check');
        console.log(emailCheck);
        if (emailCheck?.status === 200) {
          // dispatchLead({ type:CLEAR, payload: {}})
          setIsReturningCustomer(true);
          if (emailCheck?.data.data.first_name) {
            setFirstName(emailCheck?.data.data.first_name);
          }

          if (emailCheck?.data.data.last_name) {
            setLastName(emailCheck?.data.data.last_name);
          }

          if (emailCheck?.data.data.last_name) {
            setLastName(emailCheck?.data.data.last_name);
          }

          // // setPhoneNumber(phonePrimary)
          // // setEmail(emailCheck?.data.data.email)

          setCustomerInfo(emailCheck?.data.data);
          onReturningCustomer(emailCheck?.data.data);

          if (emailCheck?.data.data.city) {
            setCity(emailCheck?.data.data.city);
          }

          if (emailCheck?.data.data.state) {
            setState(emailCheck?.data.data.state);
          }

          if (emailCheck?.data.data.zip_code) {
            setZipInputValue(emailCheck?.data.data.zip_code);
          }

          setDisabled(true);
          // setZipDisabled(true);
        } else {
          // Any lead data past billing info needs to be cleared out if the email does not exist
          enableBooking();
          setIsReturningCustomer(false);
          onReturningCustomer(null);
          setCustomerInfo(null);
        }
      } catch (error) {
        console.log('Error checking email existence:', error);
        enableBooking();
        setIsReturningCustomer(false);
        onReturningCustomer(null);
        setCustomerInfo(null);
      }
    },
    2000,
    { trailing: true }
  );

  // Clear the lead information
  const handleClearLead = () => {
    dispatchLead({ type: CLEAR, payload: {} });
    dispatchFranchisee({ type: CLEAR, payload: {} });
    axios.delete('/api/search-zip-code');
    setZipInputValue('');
    // setZipDisabled(false)
    setIsReturningCustomer(false);
    setCustomerInfo(null);
  };

  const firstNameInputRef = useRef(null);
  const zipCodeInputRef = useRef(null);

  useEffect(() => {
    if (firstNameInputRef.current && !disabled) {
      firstNameInputRef.current.focus();
    }
  }, [firstNameInputRef, disabled]);

  useEffect(() => {
    if (zipCodeInputRef.current && !disabled) {
      zipCodeInputRef.current.focus();
    }
  }, [zipCodeInputRef, disabled]);

  useEffect(() => {
    if (allFieldsAreValid() && email !== '') {
      checkIfEmailExists.callback();
    }
  }, [email, phonePrimary, firstName, lastName]);

  /* Submit Form Data to the API.  If successful, set the lead data in the provider */
  const submitBillingInfo = useDebouncedCallback(
    async () => {
      if (!allFieldsAreValid()) {
        return;
      }

      const requestData: BillingInfoData = {
        firstName,
        lastName,
        email,
        phonePrimary,
        franchiseeId: isReturningCustomer
          ? customerInfo?.franchisee_id
          : franchiseeId,
        leadNotification: sentLeadNotification,
        referral: domainRef,
        city,
        state,
        zipCode: isReturningCustomer ? customerInfo?.zip_code : zipInputValue,
        utmSource: 'N/A',
        utmMedium: 'N/A',
        utmCampaign: 'N/A',
        promotionSMS: sessionStorage.getItem('promotionSMS') === 'true' || false,
        transactionSMS: true
      };

      if (lead?.id && lead?.id !== -1) {
        requestData.leadId = isReturningCustomer
          ? customerInfo?.lead_id
          : lead.id;
        requestData.franchiseeId = isReturningCustomer
          ? customerInfo?.franchisee_id
          : franchiseeId;
        sessionStorage.setItem('leadId', lead!.id.toString());
      }

      console.log('BookingBillingInfo requestData', requestData);
      // return

      setLoading(true);

      await axios
        .get('/api/utm-tracking-session/')
        .then((trackingResult) => {
          requestData.utmSource =
            trackingResult.data.data.utmTracking.utmSource;
          requestData.utmMedium =
            trackingResult.data.data.utmTracking.utmMedium;
          requestData.utmCampaign =
            trackingResult.data.data.utmTracking.utmCampaign;
        })
        .catch((e) => {
          // console.log('trackingResult ERROR', e)
        });

      axios
        .post('/api/billing-info/', requestData)
        .then(({ data, status }: AxiosResponse) => {
          console.log('BookingBillingInfo The data is: ', data);

          setLoading(false);
          switch (status) {
            case 200:
              if (data?.lead?.id) {
                if (data?.lead?.id === -1) {
                  setLeadToast(true);
                }
                datadogRum.setUser({
                  id: data?.lead?.id,
                  name: `${data.lead.firstName} ${data.lead.lastName}`,
                  email: data.lead.email,
                });
                try {
                  (window as any).dataLayer = (window as any).dataLayer || [];
                  (window as any).dataLayer.push({
                    event: 'formSubmit',
                    formName: 'Contact Information',
                    formZip: zipInputValue,
                    formId: data?.lead?.id,
                  });
                } catch (e) {
                  console.log(e);
                }

                data.lead.leadNotification = sentLeadNotification;

                dispatchLead({
                  type: BILLING_INFO,
                  payload: data.lead,
                });

                setSentLeadNotification(true);

                // Make sure lead notification is only sent once

                // setLead(data.lead);
                // setShowSuccessToast(true);
                axios
                  .get('/api/user-location-session/')
                  .then((locationResult) => {
                    const { latitude, longitude } =
                      locationResult.data.data.userLocation;
                    try {
                      db.ref(
                        process.env.kpiDashboardCollectionName +
                          '/' +
                          data?.lead?.id
                      ).set({
                        firstName,
                        lastName,
                        lat: latitude,
                        lng: longitude,
                        email,
                        phonePrimary,
                        leadID: data.lead.id,
                        step: 1,
                        franchiseName: franchisee.name,
                      });

                      // Set the /users/:userId value to true
                    } catch (error) {
                      Sentry.captureException(error);
                      console.log(error);
                    }
                  })
                  .catch((e) => {
                    console.log(e);
                    Sentry.captureException(e);
                  });
                try {
                  const userStatusDatabaseRef = db.ref(
                    `/online/${data?.lead?.id}`
                  );

                  db.ref('.info/connected').on('value', async (snap) => {
                    if (snap.val() === true) {
                      await userStatusDatabaseRef.onDisconnect().remove();
                      await userStatusDatabaseRef.set({
                        leadID: data?.lead?.id,
                      });
                    } else {
                      await userStatusDatabaseRef.remove();
                    }
                  });
                } catch (error) {
                  console.log(error);
                }
              } else {
                /* something went wrong (status 400) */
                // console.log('else block', result);
                // pushError(result.message);
              }
              break;
            case 400:
              break;
            default:
              break;
          }
        })
        .catch((error) => {
          /* something went wrong (problem on client) */
          setLoading(false);
          // console.log(error);
          Sentry.captureException(error);
        });
    },
    2000,
    { trailing: true }
  );

  useEffect(() => {
    // Valid zip with appropriate length and franchisee selected
    if (zipInputValue && zipInputValue.length === 5) {
      axios
        .post('/api/get-franchisee-by-zone-zip-code/', {
          zipCode: zipInputValue,
        })
        .then((res) => {
          // console.log('The res is...')
          // console.log(res)
          if (res.data.data.length === 1) {
            // console.log('Only one location returned and should be auto selected upon the zip code being entered')
            const franchiseeData = res.data.data[0];
            console.log(franchiseeData);
            dispatchFranchisee({
              type: REPLACE,
              payload: {
                id: franchiseeData.id,
                name: franchiseeData.name,
                phonePrimary: franchiseeData.phone_primary,
                addressLineOne: franchiseeData.address_line_one,
                city: franchiseeData.city,
                state: franchiseeData.state,
                zipCode: franchiseeData.zip_code,
                slug: franchiseeData.slug,
                latitude: franchiseeData.latitude,
                longitude: franchiseeData.longitude,
                teamCount: franchiseeData.team_count,
              },
            });
            sessionStorage.setItem('selectedStore', franchiseeData.slug);
            setDisabled(false);
          } else if (res.data.data.length === 0) {
            axios
              .post('/api/get-locations/', {
                zipCode: zipInputValue,
              })
              .then((res) => {
                if (res.data?.data?.length === 1) {
                  const franchiseeData = res.data.data[0];
                  dispatchFranchisee({
                    type: REPLACE,
                    payload: {
                      id: franchiseeData.id,
                      name: franchiseeData.name,
                      phonePrimary: franchiseeData.phone_primary,
                      addressLineOne: franchiseeData.address_line_one,
                      city: franchiseeData.city,
                      state: franchiseeData.state,
                      zipCode: franchiseeData.zip_code,
                      slug: franchiseeData.slug,
                      latitude: franchiseeData.latitude,
                      longitude: franchiseeData.longitude,
                      teamCount: franchiseeData.team_count,
                    },
                  });
                  sessionStorage.setItem('selectedStore', franchiseeData.slug);
                  setDisabled(false);
                } else if (!router.query.franchise_id) {
                  setShowStorePicker(true);
                }
              });
          } else {
            setShowStorePicker(true);
          }
        })
        .catch((e) => {
          console.log(e);
          Sentry.captureException(e);
        });
    } else {
      setShowStorePicker(false);
    }
  }, [zipInputValue]);

  // @ts-ignore
  useEffect(submitBillingInfo.callback, [
    firstName,
    lastName,
    email,
    phonePrimary,
    zipInputValue,
    franchiseeId,
  ]);

  useEffect(() => {
    let shouldDisable = true;

    if (franchisee.id !== -1 && !isReturningCustomer) {
      if (zipInputValue && zipInputValue.length === 5) {
        shouldDisable = false;
      }
    }

    if (!isReturningCustomer && checkEmail && allFieldsAreValid()) {
      enableBooking();
    } else if (lead?.email) {
      enableBooking();
    }

    setDisabled(shouldDisable);
  }, [
    franchisee,
    isReturningCustomer,
    disabled,
    firstName,
    lastName,
    email,
    phonePrimary,
  ]);

  useEffect(() => {
    async function fetchTAC() {
      try {
        const termsAndConditions = await PrismicClient().getSingle(
          'terms-and-conditions',
          {}
        );
        setTacData(termsAndConditions);
      } catch (e) {
        console.log(e);
      }
    }
    fetchTAC();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const redirectZipCode = router.query.zip_code;
    if (redirectZipCode) {
      const franchiseIdParam = router.query.franchise_id;
      const franId = parseInt(
        typeof franchiseIdParam === "string" ? franchiseIdParam : franchiseIdParam?.[0] ?? ""
      );
      const slug = Array.isArray(router.query.franchise_slug)
      ? router.query.franchise_slug[0]
      : router.query.franchise_slug ?? '';
      setZipInputValue(redirectZipCode);
      dispatchFranchisee({
        type: REPLACE,
        payload: {
          id: franId,
          addressLineOne: router.query.franchise_address_line_one,
          city: router.query.franchise_city,
          state: router.query.franchise_state,
          zipCode: router.query.franchise_zip_code,
          name: router.query.franchise_name,
          slug: router.query.franchise_slug,
          phonePrimary: router.query.franchise_phone_number,
          teamCount: 1
        },
      });
      sessionStorage.setItem('selectedStore', slug);
      setShowStorePicker(false);
    }
    router.replace(router.pathname, undefined, { shallow: true });
  }, [router.isReady]);

  return (
    <>
      {/* <DeleteLeadButton className="mb-3" /> */}
      <p
        className=' mb-4'
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <strong className='form-section-header' style={{ flex: 1 }}>
          Let's Find Your Store
        </strong>
      </p>
      <div
        style={{
          display: 'flex',
          marginBottom: '15px',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '15px',
          }}
        >
          <input
            value={isReturningCustomer ? customerInfo?.zip_code : zipInputValue}
            className={`${zipDisabled ? 'book__gated' : ''}`}
            placeholder='Zip Code'
            ref={zipCodeInputRef}
            onChange={(e) => {
              // Remove non-numeric characters from input
              const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
              // Limit the input to 5 characters
              if (sanitizedValue.length > 5) return;
              setZipInputValue(sanitizedValue);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setShowStorePicker(true);
              }
            }}
            disabled={zipDisabled ? true : false}
            style={{
              background: `${zipDisabled ? '#e9ecef' : ''}`,
              outline: 'none',
              color: '#495057',
              fontFamily: 'Gotham Medium',
              width: '150px',
              paddingLeft: '10px',
              textAlign: 'left',
              // pointerEvents: `${zipDisabled ? 'none' : 'auto'}`,
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {franchiseeName !== 'Home' && (
              <div style={{ fontSize: '14px' }}>
                Your store{' '}
                <span
                  style={{
                    color: '#cf2680',
                    fontFamily: 'Gotham Bold',
                    cursor:
                      franchiseeName === 'Home' ? 'pointer' : 'not-allowed',
                  }}
                >
                  {franchiseeName === 'Home'
                    ? 'ENTER YOUR ZIP CODE'
                    : franchiseeName?.toUpperCase()}
                </span>{' '}
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className=' mb-4'
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <strong className='form-section-header' style={{ flex: 1 }}>
          Contact Information
        </strong>
        <SyncLoader color={pink500} size={5} loading={loading} />
        {isReturningCustomer && (
          <button
            className='clear-lead-button'
            onClick={handleClearLead}
            aria-label='Clear Lead Information'
          >
            X
          </button>
        )}
      </div>
      <Form
        id='booking-form-billing-info'
        className={`needs-validation ${disabled ? 'book__gated' : ''}`}
      >
        <Form.Row className='form-row'>
          <Form.Group as={Col}>
            <Form.Control
              ref={firstNameInputRef}
              id='bookFirstName'
              type='text'
              placeholder='First Name'
              name='firstName'
              autoComplete='given-name'
              required
              value={firstName || ''}
              disabled={disabled}
              onChange={(e) => {
                const nameInput = e.currentTarget.value.replace(
                  /[^a-zA-Z]+/g,
                  ''
                );
                const uppercaseName =
                  nameInput.charAt(0).toUpperCase() + nameInput.slice(1);
                setFirstName(uppercaseName);
                checkFirstName.callback();
              }}
            />
            <Form.Control.Feedback type='invalid' className='invalid-feedback'>
              Please enter your first name.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className='form-group col'>
            <Form.Control
              id='bookLastName'
              type='text'
              placeholder='Last Name'
              name='lastName'
              autoComplete='family-name'
              required
              value={lastName || ''}
              disabled={disabled}
              onChange={(e) => {
                const lastNameInput = e.currentTarget.value.replace(
                  /[^a-zA-Z]+/g,
                  ''
                );
                const uppercaseLastName =
                  lastNameInput.charAt(0).toUpperCase() +
                  lastNameInput.slice(1);
                setLastName(uppercaseLastName);
                checkLastName.callback();
              }}
            />
            <Form.Control.Feedback type='invalid'>
              Please enter your last name.
            </Form.Control.Feedback>
          </Form.Group>
        </Form.Row>

        <Form.Group>
          <NumberFormat
            customInput={Form.Control}
            value={phonePrimary || ''}
            disabled={disabled}
            className='form-control'
            type='tel'
            id='bookPhone'
            name='bookPhone'
            format='(###) ###-####'
            placeholder='Phone Number'
            onChange={(e) => {
              let formatPhone = e.target.value.replace(/[ )(]/g, '');
              if (formatPhone[10] !== '_')
                formatPhone = `${formatPhone.slice(0, 3)}-${formatPhone.slice(
                  3
                )}`;

              setPhoneNumber(formatPhone);
              checkPhonePrimary.callback();
            }}
            // allowEmptyFormatting
            mask='_'
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Control
            type='email'
            id='bookEmail'
            placeholder='Email Address'
            name='email'
            value={email || ''}
            autoComplete='email'
            onChange={(e) => {
              setEmail(e.target.value.toLowerCase());
            }}
            onBlur={() => {
              checkEmail.callback();
            }}
            disabled={disabled}
            required
          />
          <Form.Control.Feedback type='invalid'>
            Please enter your email address.
          </Form.Control.Feedback>
        </Form.Group>
      </Form>
      <BookingOptSMS />
      {isReturningCustomer && (
        <ReturningCustomerWelcome customerInfo={customerInfo} />
      )}

      {/* Toasts */}
      <ToastWrapper>
        <Toast
          onClose={() => setFirstNameToast(false)}
          show={firstNameToast}
          delay={4000}
          autohide
        >
          <Toast.Body className='toast-error'>
            Please enter a first name with more than 2 letters.
          </Toast.Body>
        </Toast>
        <Toast
          onClose={() => setLastNameToast(false)}
          show={lastNameToast}
          delay={4000}
          autohide
        >
          <Toast.Body className='toast-error'>
            Please enter a last name with more than 2 letters.
          </Toast.Body>
        </Toast>
        <Toast
          onClose={() => setEmailToast(false)}
          show={emailToast}
          delay={4000}
          autohide
        >
          <Toast.Body className='toast-error'>
            Please enter a valid email.{' '}
            {emailToastText.length > 1 && (
              <div>Did you mean {emailToastText}?</div>
            )}
          </Toast.Body>
        </Toast>
        <Toast
          onClose={() => setPhoneToast(false)}
          show={phoneToast}
          delay={4000}
          autohide
        >
          <Toast.Body className='toast-error'>
            Please fill in your phone number.
          </Toast.Body>
        </Toast>
        <Toast onClose={() => setLeadToast(false)} show={leadToast}>
          <Toast.Body className='toast-error'>
            An error has occured. Please refresh the page.
          </Toast.Body>
        </Toast>
      </ToastWrapper>
      {showStorePicker && (
        <MemoizedBookingStorePicker
          showBookingModal={showStorePicker}
          handleShowStorePicker={handleShowStorePicker}
          zipInputValue={zipInputValue}
        />
      )}

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
        aria-labelledby='contained-modal-title-vcenter'
        centered
        style={{ padding: '10px' }}
        scrollable={true}
        className='tac-modal'
      >
        <Modal.Header className='d-flex justify-content-between align-items-center'>
          <Modal.Title style={{ margin: 'auto' }}>
            Terms and Conditions
          </Modal.Title>
          <Button
            onClick={() => setShowModal(false)}
            title='home'
            className='btn btn-sm btn-primary'
          >
            Close
          </Button>
        </Modal.Header>
        <Modal.Body className='px-0'>
          <Section xs={11} lg={11}>
            <Row className='justify-content-center'>
              <Col xs={12} lg={12} xl={12}>
                <div className='mb-3'>
                  <span className='text-uppercase font-weight-bold'>
                    Last Updated{' '}
                    {DateTime.fromISO(
                      tacData?.last_publication_date
                    ).toLocaleString(DateTime.DATE_FULL)}
                  </span>
                </div>
                <RichText
                  render={tacData?.data?.content ?? ' '}
                  htmlSerializer={htmlSerializer}
                />
                <span className='text-uppercase font-weight-bold'>
                  Last Updated{' '}
                  {DateTime.fromISO(
                    tacData?.last_publication_date
                  ).toLocaleString(DateTime.DATE_FULL)}
                </span>
              </Col>
            </Row>
          </Section>
        </Modal.Body>
      </Modal>
    </>
  );
};
export default BookingBillingInfo;
