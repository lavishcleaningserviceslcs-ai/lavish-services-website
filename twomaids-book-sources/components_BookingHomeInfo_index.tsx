/* eslint-disable radix */
import * as Sentry from '@sentry/node';
import axios, { AxiosResponse } from 'axios';
import _debounce from 'lodash/debounce';
import { userInfo } from 'os';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Col, Form, ListGroup, Toast } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import SyncLoader from 'react-spinners/SyncLoader';
import { useDebouncedCallback } from 'use-debounce';
import homeInfo, { HomeInfoData } from '../../SDKs/Gataware/partial/homeInfo';
import db from '../../SDKs/firebase/firebase';
import { useFranchiseeContext } from '../../context/Franchisee';
import { HOME_INFO, useLeadContext } from '../../context/Lead';
import { pink500 } from '../../ui/colors';
import PhoneLink from '../PhoneLink';
import ToastWrapper from '../ToastWrapper';

interface BookingHomeInfoProps {
  bookingDisabled?: boolean;
  enablePackage?: any;
  isReturningCustomer?: any;
  customerInfo?: any;
}
const BookingHomeInfo: React.FC<BookingHomeInfoProps> = ({
  bookingDisabled,
  enablePackage,
  isReturningCustomer,
  customerInfo
}: BookingHomeInfoProps) => {
  const { franchisee } = useFranchiseeContext();
  const franchiseePhone = franchisee?.phonePrimary;
  const franchiseeId = franchisee?.id;
  const { lead, dispatchLead } = useLeadContext();
  const dispatch = useDispatch();
  /* Form Fields */
  const [bedroomCount, setBedroomCount] = useState<number>(
    lead?.bedrooms ?? null
  );

  const [bathroomCount, setBathroomCount] = useState<number>(
    lead?.bathrooms ?? null
  );

  const [peopleCount, setPeopleCount] = useState<number>(lead?.people ?? null);

  const [petsCount, setPetsCount] = useState<number>(lead?.pets ?? null);

  const [squareFeet, setSquareFeet] = useState<number>(
    lead?.squareFootage ?? null
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [sqftToast, setSqftToast] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  let onlineUserReference;

  // set values for inputs if the lead is already in the system
  /* Enable user editing once there's a leadId */
  useEffect(() => {

    setDisabled(lead?.id == -1);
    setBedroomCount(lead?.bedrooms ?? 0);
    setBathroomCount(lead?.bathrooms ?? 0);
    setPeopleCount(lead?.people ?? 0);
    setPetsCount(lead?.pets ?? 0);
    setSquareFeet(lead?.squareFootage ?? 0);
    
  }, [lead]);

  /* validate that Home info is ready to update */

  const allFieldsAreValid = () =>
    lead?.id > -1 &&
    bedroomCount > 0 &&
    bathroomCount > 0 &&
    peopleCount > 0 &&
    squareFeet >= 499 &&
    squareFeet <= 6000;

  const parseStringToAbsolute = (input: string) => Math.abs(parseInt(input));

  function bathroomValidation(input: string) {
    const bathroomNumber = Math.abs(parseFloat(input));
    if (bathroomNumber > 99) return 99;
    if (bathroomNumber % 0.5) {
      return Math.round(bathroomNumber);
    } else return bathroomNumber;
  }

  useEffect(() => {
    if (allFieldsAreValid()) {
      enablePackage();
      if (!lead.hasOwnProperty('squareFootage')) {
        submitHomeInfo.callback();
      }
    }
  }, [bedroomCount, bathroomCount, peopleCount, squareFeet, petsCount, lead]);

  const detectUserAction = () => {
    if (lead?.id === -1) return;
    try {
      onlineUserReference = db.ref(`/online/${lead?.id}`);
      onlineUserReference.update({ typing: true });

      setTimeout(() => {
        onlineUserReference.update({ typing: false });
      }, 500);
    } catch (error) {
      console.log(error);
    }
  };

  const submitHomeInfo = useDebouncedCallback(() => {
    
    if (!allFieldsAreValid()) { return;}
    
    setLoading(true);
    
    const requestData: HomeInfoData = {
      leadId: isReturningCustomer ? customerInfo?.lead_id : lead.id,
      franchiseeId: isReturningCustomer ? customerInfo?.franchisee_id : franchiseeId,
      people: peopleCount,
      pets: petsCount,
      bedrooms: bedroomCount,
      bathrooms: bathroomCount,
      squareFootage: squareFeet,
    };

    axios
      .post('/api/home-info/', requestData)
      // .then((result) => {
      .then(({ data, status }: AxiosResponse) => {
        let result = data;
        setLoading(false);

        switch (status) {
          case 200:
            if (result.lead) {
              dispatchLead({ type: HOME_INFO, payload: result.lead });
              try {
                db.ref(
                  process.env.kpiDashboardCollectionName +
                    '/' +
                    result?.lead?.id
                ).update({
                  franchiseeId,
                  people: peopleCount,
                  pets: petsCount,
                  bedrooms: bedroomCount,
                  bathrooms: bathroomCount,
                  squareFootage: squareFeet,
                  leadID: isReturningCustomer ? customerInfo?.lead_id : result.lead.id,
                  firstName: lead.firstName,
                  lastName: lead.lastName,
                  email: lead.email,
                  phonePrimary: lead.phonePrimary,
                  step: 2,
                });
              } catch (error) {
                Sentry.captureException(error);
                console.log(error);
              }
              try {
                const userStatusDatabaseRef = db.ref(`/online/${lead?.id}`);

                db.ref('.info/connected').on('value', async (snap) => {
                  if (snap.val() === true) {
                    await userStatusDatabaseRef.onDisconnect().remove();
                    await userStatusDatabaseRef.set({
                      leadID: lead?.id,
                    });
                  } else {
                    await userStatusDatabaseRef.remove();
                  }
                });
              } catch (error) {
                console.log(error);
              }
            }
            break;
          case 400:
            break;
          default:
            break;
        }
      })
      .catch((error) => {
        Sentry.captureException(error);
        // console.log({ error });
        setLoading(false);
      });
    detectUserAction();
  }, 2000,
  { trailing: true });

  const checkSqft = useDebouncedCallback(
    () => {
      if (squareFeet < 500) setSqftToast(true);
      if (petsCount === null) setPetsCount(0);
    },
    1000,
    { trailing: true }
  );

  useEffect(submitHomeInfo.callback, [
    bedroomCount,
    bathroomCount,
    peopleCount,
    petsCount,
    squareFeet,
  ]);

  return (
    <>
    {
      isReturningCustomer ? (
        <>
        <strong className='form-section-header'>
          Home Details
        </strong>
        <div className='returning-customer-home-details'>
          <div className='returning-customer-home-details-value'>
            <p className='returning-home-label'>Bedrooms</p>
            <p className='returning-home-value'>{bedroomCount}</p>
          </div>

          <div>
            <p className='returning-home-label'>Bathrooms</p>
            <p className='returning-home-value'>{bathroomCount}</p>
          </div>

          <div>
            <p className='returning-home-label'>People</p>
            <p className='returning-home-value'>{peopleCount}</p>
          </div>

          <div>
            <p className='returning-home-label'>Pets</p>
            <p className='returning-home-value'>{petsCount}</p>
          </div>

          <div>
            <p className='returning-home-label'>Square Footage</p>
            <p className='returning-home-value'>{squareFeet}</p>
          </div>
        </div>
        </>
      ) : (
      <Form id='booking-form-house-info' className='needs-validation' noValidate>
      <div className={`book__gated ${!bookingDisabled && !isReturningCustomer && 'active'}`}>
        <div className='d-flex justify-content-between align-items-center'>
          <p className='mt-4 mb-4'>
            <strong className='form-section-header'>
              Tell Us About Your Home
            </strong>
          </p>
          <SyncLoader color={pink500} size={5} loading={loading} />
        </div>
        <Form.Row className='align-items-end booking-home-info-inputs'>
          <Form.Group as={Col}>
            <Form.Label className='form-section-labels' htmlFor='bookBedrooms'>
              Bedrooms
            </Form.Label>
            <Form.Control
              id='bookBedrooms'
              type='number'
              pattern='[0-9]*'
              placeholder='0'
              name='bedrooms'
              min='0'
              data-calculated-field='true'
              disabled={bookingDisabled || isReturningCustomer}
              value={bedroomCount || ''}
              onChange={(e) => {
                const newBedroomCount: number = parseStringToAbsolute(
                  e.target.value
                );
                newBedroomCount > 99
                  ? setBedroomCount(99)
                  : setBedroomCount(newBedroomCount);
              }}
            />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label className='form-section-labels' htmlFor='bookBathrooms'>
              Bathrooms
            </Form.Label>
            <Form.Control
              id='bookBathrooms'
              type='number'
              pattern='[0-9]*'
              placeholder='0'
              name='bathrooms'
              min='0'
              data-calculated-field='true'
              disabled={bookingDisabled || isReturningCustomer}
              value={bathroomCount || ''}
              onChange={(e) => {
                const newBathroomCount: number = bathroomValidation(
                  e.target.value
                );
                setBathroomCount(newBathroomCount);
              }}
            />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label className='form-section-labels' htmlFor='bookPeople'>
              People
            </Form.Label>
            <Form.Control
              id='bookPeople'
              type='number'
              pattern='[0-9]*'
              placeholder='0'
              name='people'
              min='0'
              data-calculated-field='true'
              disabled={bookingDisabled || isReturningCustomer}
              value={peopleCount || ''}
              onChange={(e) => {
                const newPeopleCount: number = parseStringToAbsolute(
                  e.target.value
                );
                newPeopleCount > 49
                  ? setPeopleCount(49)
                  : setPeopleCount(newPeopleCount);
              }}
            />
          </Form.Group>
          <Form.Group as={Col} className='form-group-pets'>
            <Form.Label className='form-section-labels' htmlFor='bookPets'>
              Pets
            </Form.Label>
            <Form.Control
              id='bookPets'
              type='number'
              pattern='[0-9]*'
              placeholder='0'
              name='pets'
              min='0'
              data-calculated-field='true'
              disabled={bookingDisabled || isReturningCustomer}
              value={petsCount?.toFixed(0) || ''}
              onChange={(e) => {
                const newPetsCount: number = parseStringToAbsolute(
                  e.target.value
                );
                newPetsCount > 9 ? setPetsCount(9) : setPetsCount(newPetsCount);
              }}
            />
          </Form.Group>
          <Form.Group as={Col} className='form-group-sqft'>
            <Form.Label
              className='form-section-labels'
              htmlFor='bookSquareFootage'
            >
              Square Footage
            </Form.Label>
            <Form.Control
              id='bookSquareFootage'
              type='number'
              pattern='[0-9]*'
              placeholder='0'
              name='squareFootage'
              min='500'
              data-calculated-field='true'
              step={100}
              disabled={bookingDisabled || isReturningCustomer}
              value={squareFeet || ''}
              onChange={(e) => {
                const newSquareFeet: number = parseStringToAbsolute(
                  e.target.value
                );
                newSquareFeet > 6000
                  ? setSquareFeet(6000)
                  : setSquareFeet(newSquareFeet);
                checkSqft.callback();
              }}
            />
          </Form.Group>
        </Form.Row>
        <hr className='mb-4' />
        <Toast as={Alert} variant='warning' show={squareFeet > 6000 && true}>
          <Toast.Body>
            <ListGroup>
              <ListGroup.Item variant='warning'>
                Please Call <PhoneLink number={franchiseePhone} /> for a quote
                to fit your cleaning needs!
              </ListGroup.Item>
            </ListGroup>
          </Toast.Body>
        </Toast>
        <ToastWrapper>
          <Toast
            show={sqftToast}
            onClose={() => setSqftToast(false)}
            delay={4000}
            autohide
          >
            <Toast.Body className='toast-error'>
              Square Footage must be larger than 500
            </Toast.Body>
          </Toast>
        </ToastWrapper>
      </div>
    </Form>)}
    </>
  );
};

BookingHomeInfo.defaultProps = {
  // add booking home info default props here
  bookingDisabled: true,
};

export default BookingHomeInfo;
