class Controller {
    
    /**
     * Log an error if val is null or undefined
     * @param  {any} val
     */
    
    assertNotNull(val) {
        if (val === null || val === 'undefined') {
            console.error(`[CONTROLLER] param 'val' = ${val}`)
        } else {
            return false
        }
    }
}

module.exports = Controller