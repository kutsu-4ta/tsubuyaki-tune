import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
import {lambdaHandler as TokenAuthorizer} from "./useCase/TokenAuthorizerFunction/app";
import {lambdaHandler as FetchProfile} from "./useCase/FetchProfileFunction/app";
import {lambdaHandler as AddTsubuyaki} from "./useCase/AddTsubuyakiFunction/app";
import {lambdaHandler as FetchTsubuyaki} from "./useCase/FetchTsubuyakiFunctution/app";

// 認可あり
export const tokenAuthorizerFunction = TokenAuthorizer;
export const fetchProfileFunction = FetchProfile;
export const addTsubuyakiFunction = AddTsubuyaki;
export const fetchTsubuyakiFunction = FetchTsubuyaki;
