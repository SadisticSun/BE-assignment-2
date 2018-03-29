const RouteController = require('./RouteController')

class IndexRoute extends RouteController {
    constructor(params) {
        super(params)
        this.renderView(params.view, params.response)
    }
}

module.exports = IndexRoute