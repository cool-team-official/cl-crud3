import * as comps from './components'
import crud from './components/crud'

export const CRUD = {
    install(app) {
        app.component('cl-crud', crud({}))

        for (let i in comps) {
            app.component(comps[i].name, comps[i]);
        }
    }
}

export default CRUD