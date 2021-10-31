import { processData } from '../utils/info.utils.js';

const infoView = (req, res) => {
    res.render('info', {
        layout: 'marcoDeslogueado',
        processData
    })
}

export { infoView }