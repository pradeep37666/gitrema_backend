import { HttpStatus } from '@nestjs/common';
import { Messages } from './constants';

export const STATUS_MSG = {
  ERROR: {
    UNAUTHORIZED: {
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Invalid Credentials',
      type: 'UNAUTHORIZED',
    },
    FORBIDDEN: {
      statusCode: HttpStatus.FORBIDDEN,
      message: 'You are forbidden to access this api',
      type: 'FORBIDDEN',
    },
    ALREADY_BOOKED: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Property already booked',
      type: 'BAD_REQUEST',
    },
    EMAIL_EXISTS: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'User exists with same email',
      type: 'EMAIL_EXISTS',
    },
    RECORD_NOT_FOUND: {
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Record does not exist for provided details',
      type: 'RECORD_NOT_FOUND',
    },
    SERVER_ERROR: {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong',
      type: 'INTERNAL_SERVER_ERROR',
    },
    ONLY_IMAGES_ALLOWED: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Only image files are allowed!',
      type: 'ONLY_IMAGES_ALLOWED',
    },
    ONLY_VIDEOS_ALLOWED: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Only video files are allowed!',
      type: 'ONLY_VIDEOS_ALLOWED',
    },
    ONLY_IDS_ALLOWED: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Only image and pdf files are allowed!',
      type: 'ONLY_IDS_ALLOWED',
    },
    ROOM_NOT_AVAILABLE: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Room is not available for provided criteria',
      type: 'ROOM_NOT_AVAILABLE',
    },
    NO_RATE_FOUND: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Rate Not available for given criteria',
      type: 'NO_RATE_FOUND',
    },
    LOW_PAYMENT: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Payment Pending',
      type: 'LOW_PAYMENT',
    },
    CAN_NOT_BE_DELETED: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Record is referenced so can not be deleted',
      type: 'CAN_NOT_BE_DELETED',
    },
    CANCELLATION_NOT_ALLOWED: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Cancellation is not allowed',
      type: 'CANCELLATION_NOT_ALLOWED',
    },
    PAYMENT_GATEWAY_ERROR: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Something went wrong while initiating the payment',
      type: 'PAYMENT_GATEWAY_ERROR',
    },
    AMOUNT_ALREADY_PAID: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Total amount for this reservation is already paid',
      type: 'AMOUNT_ALREADY_PAID',
    },
    MISSING_DETAILS: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Missing required details',
      type: 'MISSING_DETAILS',
    },
    CHECKIN_NOT_ALLOWED: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Checkin not allowed',
      type: 'CHECKIN_NOT_ALLOWED',
    },
    PASSWORD_VERIFICATION_FAILED: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'password does not match',
      type: 'VERIFICATION_FAILED',
    },

    ERROR_SMS: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Error Sending SMS',
      type: 'ERROR_SMS',
    },
    VERIFICATION_FAILED: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'OTP Verification Failed',
      type: 'VERIFICATION_FAILED',
    },
    DOMAIN_NOT_ALLOWED: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Doamin not allowed',
      type: 'DOMAIN_NOT_ALLOWED',
    },
    ERROR_GENERATING_INVOICE: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Error Generating Invoice',
      type: 'ERROR_GENERATING_INVOICE',
    },
    ALREADY_EXISTS: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Record already exists',
      type: 'ALREADY_EXISTS',
    },
    NOT_ALLOWED: {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Action not allowed',
      type: 'NOT_ALLOWED',
    },
  },
  SUCCESS: {
    AUTHIORIZED: {
      statusCode: HttpStatus.ACCEPTED,
      message: Messages.SUCCESS,
      type: 'Authorized',
    },
    ADDED: {
      message: 'Record added successfully',
      type: 'ADDED',
    },
    UPDATED: {
      message: 'Record updated successfully',
      type: 'UPDATED',
    },
    DELETED: {
      message: 'Record deleted successfully',
      type: 'DELETED',
    },
  },
};
