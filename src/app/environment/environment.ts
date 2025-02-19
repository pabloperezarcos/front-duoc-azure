/* RabbitMQ - POSTA ADULTO */
export const environmentRabbitmq = { production: false, apiGatewayUrl: 'https://srefrgfwmd.execute-api.us-east-1.amazonaws.com/api/alertas' };
//export const environmentRabbitmq = { production: false, apiGatewayUrl: 'http://localhost:8080/api/alertas' };


/* Kafka - POSTA INFANTIL */
//export const environmentKafka = { production: false, apiGatewayUrl: 'https://srefrgfwmd.execute-api.us-east-1.amazonaws.com/api/alertas' };
export const environmentKafka = { production: false, apiGatewayUrl: 'http://localhost:9081/api/alertas/enviar' };