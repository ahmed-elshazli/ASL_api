import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 10,
    duration: '20s',
};

export default function () {
    const res = http.get(
        'http://localhost:3000/api/v1/users',
    );

    // check(res, {
    //     'status is 200': (r) => r.status === 200,
    // });
     console.log(res.status);
}