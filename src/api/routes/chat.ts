import _ from 'lodash';

import Request from '@/lib/request/Request.ts';
import Response from '@/lib/response/Response.ts';
import chat from '@/api/controllers/chat.ts';
import logger from '@/lib/logger.ts';

export default {

    prefix: '/v1/chat',

    post: {

        '/completions': async (request: Request) => {
            request
                .validate('body.model', v => /^[a-z0-9]{24,}$/.test(v))
                .validate('body.conversation_id', v => _.isUndefined(v) || _.isString(v))
                .validate('body.messages', _.isArray)
                .validate('headers.authorization', _.isString)
            // refresh_token切分
            const apiKeys = chat.apiKeySplit(request.headers.authorization);
            // 随机挑选一个refresh_token
            const apiKey = _.sample(apiKeys);
            const { model, conversation_id: convId, messages, stream } = request.body;
            if (stream) {
                const stream = await chat.createCompletionStream(model, messages, apiKey, convId);
                return new Response(stream, {
                    type: "text/event-stream"
                });
            }
            else
                return await chat.createCompletion(model, messages, apiKey, convId);
        }

    }

}