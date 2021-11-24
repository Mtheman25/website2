import {api} from '../../server/api';
import {z} from 'zod';
import {DISCORD_WEBHOOK} from '../../constants';
import {NextkitException} from 'nextkit';

const schema = z.object({
	email: z.string().email(),
	body: z.string().max(500).min(3),
	is_json: z.boolean().optional(),
});

export default api({
	async POST({req}) {
		const {is_json = false, ...body} = schema.parse(req.body);

		const result = await fetch(DISCORD_WEBHOOK, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				content: 'new email innit',
				embeds: [
					{
						description: body.body,
						author: {
							name: body.email,
						},
						fields: [
							{
								name: 'ip',
								value:
									req.headers['x-forwarded-for'] ??
									req.connection.remoteAddress ??
									'unknown!?',
							},
						],
					},
				],
			}),
		});

		if (result.status >= 400) {
			throw new NextkitException(result.status, 'Error sending notification');
		}

		if (is_json) {
			return {
				sent: true,
			};
		}

		return {
			_redirect: '/thanks',
		};
	},
});
