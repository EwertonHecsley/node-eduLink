import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

const app = fastify({
    logger:{
        transport:{
            target:'pino-pretty',
            options:{
                translateTime:'HH:MM:ss Z',
                ignore:'pid,hostname'
            }
        }
    }
});

app.register(helmet,{
    global:true
});
app.register(cors,{
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
});

app.get('/health',async ()=>{
    return {status:'OK'};
});


export default app;