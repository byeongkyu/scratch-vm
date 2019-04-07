const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const log = require('../../util/log');
const cast = require('../../util/cast');
const formatMessage = require('format-message');
const BLE = require('../../io/ble');
const Base64Util = require('../../util/base64-util');

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABG2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+Gkqr6gAAAYJpQ0NQc1JHQiBJRUM2MTk2Ni0yLjEAACiRdZG/S0JRFMc/alGUYVBDQ4NENZmUgtQSpIQFEWIG/Vr05Y9A7fGeEtIatAoFUUu/hvoLag2ag6AogmhpaS5qKXmdp4ISeS7nns/93nsO954L1khayehNw5DJ5rRw0O9cWFxytrxipRsHXtxRRVcnQqEZGtrXAxYz3g2ZtRqf+9faV+O6ApZW4XFF1XLCU8IzGznV5F3hbiUVXRU+F3ZpckHhe1OPVfjN5GSFf0zWIuEAWDuFnck6jtWxktIywvJy+jPpvFK9j/kSezw7PyexT7wXnTBB/DiZZpIAPkYYk9nHEB7csqJB/nA5f5Z1yVVkVimgsUaSFDlcoualelxiQvS4jDQFs/9/+6onvJ5Kdbsfml8M42MAWnagVDSM72PDKJ2A7RmusrX89SMY/RS9WNP6D8GxBRfXNS22B5fb0POkRrVoWbKJWxMJeD+DjkXouoW25UrPqvucPkJkU77qBvYPYFDOO1Z+AZfFZ/yiFCQNAAAACXBIWXMAAAsTAAALEwEAmpwYAAACwklEQVR4nO3az0sUYRzH8feMi2u6aiUmFpVtFARmRIeO7aFD0iFQaruLeOjSocgO0T8QFEKH2DoEQRiFRUQEEnoIIzqVQgmhZWIm2w8bc1fXmS7+2HVn12d11kfa7wsWdmae55nPfJnnYRgGhBBCCCGEEIXIUG0YCVECHASq8hfHE1HgfWsPMZXGSgWIhGgDrgGBNQRbTxZwobWHWys1XLEAkRBNwCMvUmnQ1NpDV7YGpsIg7ckbDub8T3n25J2DkSlXe6Y+C3wK4zcs/Bkr2U1/xVEAamPD1E++yTVrXnwK1DNUegCAfdY76v5+WDh0aKW+We+ASAgT8K81oEb++WvISGUK/NcKvgAqa0BOHAws2/NhAQiYCQwcT8fMKanp2BQ5CQCKHNu1jWX7uBPdv/ZkLlqqBik3Z7PmMnHPlUlOBaiJj1AzMZLTCdZDcGqA4NTAqvrKGrB8RzgcPgbsAOh2HI5/f7DuobzUve3M2XB48eFotLOzszf5uNsUuAQ0AmAY3q44OhjGPZYe+Z8DKQUo+CkgBdAdQDcpgO4AukkBdAfQTQqgO4BuUgDdAXSTAugOoJsUQHcA3aQAugPopvxStGLvYYKnL1NcWQ2APRNn9OVdxnrvp7QLmAlaqga9TZk09nLVRxrZdfIcRZvKAEhM/Wb48XV+9PemtXWjXICdJ9oor2tI2RdsvsS3Vw9xEkuvqg0c11fX+bKn+SL+rdsXt/1baqk7dV65AMpTwFe2Ob1zcQmmr1h1iLzwlVam73PJmknBrwHKBZiLWWn77Nl4yu2vg1uuxPQf5f7KBfj64jbT40PMxSzmYhYzk1E+P+3ATswonywfhp/cIP5zbDFXLDrKl2c3lfsrL4K/Pr7m7dXGVYXMp/G+Lsb7sn4Fk1XBrwFud8AVoGP+v0MOn9JtUMnXMKEziBBCCCGEEGLj+AdrerOu0sUfeQAAAABJRU5ErkJggg==";
const BLETimeout = 2500;
const BLEDataStoppedError = 'edubot extension stopped receiving data';


const BLEUUID = {
    motor_service:                 0xe005,
    char_motor_set_step:          '34443c33-3356-11e9-b210-d663bd873d93',
    char_motor_set_speed:         '34443c34-3356-11e9-b210-d663bd873d93',
    char_motor_set_distance:      '34443c35-3356-11e9-b210-d663bd873d93',
    char_motor_set_rotation:      '34443c40-3356-11e9-b210-d663bd873d93',
    char_motor_set_accel:         '34443c36-3356-11e9-b210-d663bd873d93',
    misc_service:                  0xe006,
    char_misc_color_led:          '34443c37-3356-11e9-b210-d663bd873d93',
    char_misc_play_sound:         '34443c38-3356-11e9-b210-d663bd873d93',
    char_misc_set_text_oled:      '34443c39-3356-11e9-b210-d663bd873d93',
    char_misc_set_image_oled:     '34443c3a-3356-11e9-b210-d663bd873d93',
    char_misc_status_info:        '34443c3b-3356-11e9-b210-d663bd873d93',
    sensor_service:                0xe007,
    char_sensor_floor_sensors:    '34443c3c-3356-11e9-b210-d663bd873d93',
    char_sensor_distance_sensors: '34443c3d-3356-11e9-b210-d663bd873d93',
    char_sensor_imu_sensors:      '34443c3e-3356-11e9-b210-d663bd873d93',
    char_sensor_all_data:         '34443c3f-3356-11e9-b210-d663bd873d93',
};

class EduBot {

    /**
     * Construct a EduBoyt communication object.
     * @param {Runtime} runtime - the Scratch 3.0 runtime
     * @param {string} extensionId - the id of the extension
     */
    constructor (runtime, extensionId) {
        this._runtime = runtime;

        this._ble = null;
        this._runtime.registerPeripheralExtension(extensionId, this);
        this._extensionId = extensionId;

        this._timeoutID = null;
        this._busy = false;
        this._busyTimeoutID = null;

        this._user_button = 1;

        this._battery = {
            volt_level: 0.0,
            low_warning: 0
        }

        this._robot_is_moving = 0;

        this._floor_sensors = {
            left_outer: 0,
            left_inner: 0,
            right_inner: 0,
            right_outer: 0
        }

        this._distance_sensor = {
            left: 0,
            right: 0
        }

        this._imu_sensors = {
            imu_roll: 0.0,
            imu_pitch: 0.0,
            imu_yaw: 0.0,
            acc_x: 0.0,
            acc_y: 0.0,
            acc_z: 0.0,
            gyro_x: 0.0,
            gyro_y: 0.0,
            gyro_z: 0.0
        }

        this._max_velocity = 300;

        this.disconnect = this.disconnect.bind(this);
        this._onConnect = this._onConnect.bind(this);
        this._onMessage = this._onMessage.bind(this);
    }

    get floorLeftOuter() {
        return this._floor_sensors.left_outer;
    }

    get floorLeftInner() {
        return this._floor_sensors.left_inner;
    }

    get floorRightInner() {
        return this._floor_sensors.right_inner;
    }

    get distanceLeft() {
        return this._distance_sensor.left;
    }

    get distanceRight() {
        return this._distance_sensor.right;
    }

    get floorRightOuter() {
        return this._floor_sensors.right_outer;
    }

    get imuRoll() {
        return this._imu_sensors.imu_roll;
    }

    get imuPitch() {
        return this._imu_sensors.imu_pitch;
    }

    get imuYaw() {
        return this._imu_sensors.imu_yaw;
    }

    get accX() {
        return this._imu_sensors.acc_x;
    }

    get accY() {
        return this._imu_sensors.acc_y;
    }

    get accZ() {
        return this._imu_sensors.acc_z;
    }

    get gyroX() {
        return this._imu_sensors.gyro_x;
    }

    get gyroY() {
        return this._imu_sensors.gyro_y;
    }

    get gyroZ() {
        return this._imu_sensors.gyro_z;
    }

    get userButton() {
        if(this._user_button == 0)
        {
            return false;
        }
        else {
            return true;
        }
    }

    get batteryLevel() {
        return this._battery.volt_level;
    }

    get checkLowWarning() {
        if(this._battery.low_warning == 0)
            return false;
        else
            return true;
    }

    get isRobotMoving() {
        if(this._robot_is_moving == 0)
            return false;
        else
            return true;
    }

    setText (str) {
        var utf8 = [];
        for (var i=0; i < str.length; i++) {
            var charcode = str.charCodeAt(i);
            if (charcode < 0x80) utf8.push(charcode);
            else if (charcode < 0x800) {
                utf8.push(0xc0 | (charcode >> 6),
                          0x80 | (charcode & 0x3f));
            }
            else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(0xe0 | (charcode >> 12),
                          0x80 | ((charcode>>6) & 0x3f),
                          0x80 | (charcode & 0x3f));
            }
            // surrogate pair
            else {
                i++;
                charcode = ((charcode&0x3ff)<<10)|(str.charCodeAt(i)&0x3ff)
                utf8.push(0xf0 | (charcode >>18),
                          0x80 | ((charcode>>12) & 0x3f),
                          0x80 | ((charcode>>6) & 0x3f),
                          0x80 | (charcode & 0x3f));
            }
        }

        return this.send(BLEUUID.misc_service, BLEUUID.char_misc_set_text_oled, utf8);
    }

    setImage (index) {
        var data = [index];
        return this.send(BLEUUID.misc_service, BLEUUID.char_misc_set_image_oled, data);
    }

    setLEDLamp (left, right) {
        var send_data = [];
        const hexToRgb = hex =>
            hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
                        ,(m, r, g, b) => '#' + r + r + g + g + b + b)
                .substring(1).match(/.{2}/g)
                .map(x => parseInt(x, 16))

        var l_rgb = hexToRgb(left);
        var r_rgb = hexToRgb(right);

        for(var i = 0; i < l_rgb.length; i++) {
            send_data.push(l_rgb[i]);
        }
        for(var i = 0; i < r_rgb.length; i++) {
            send_data.push(r_rgb[i]);
        }

        return this.send(BLEUUID.misc_service, BLEUUID.char_misc_color_led, send_data);
    }

    setStep (l_step, r_step) {
        var send_data = [];

        send_data.push((l_step >> 24) & 0xFF);
        send_data.push((l_step >> 16) & 0xFF);
        send_data.push((l_step >> 8) & 0xFF);
        send_data.push((l_step) & 0xFF);
        send_data.push((r_step >> 24) & 0xFF);
        send_data.push((r_step >> 16) & 0xFF);
        send_data.push((r_step >> 8) & 0xFF);
        send_data.push((r_step) & 0xFF);
        send_data.push((this._max_velocity >> 8) & 0xFF);
        send_data.push((this._max_velocity) & 0xFF);

        return this.send(BLEUUID.motor_service, BLEUUID.char_motor_set_step, send_data);
    }

    setMaxVel (max_vel) {
        if(max_vel == 0) {
            this._max_velocity = 300;
        }
        else {
            this._max_velocity = max_vel;
        }
    }

    setAccel (accel) {
        var send_data = [accel];

        return this.send(BLEUUID.motor_service, BLEUUID.char_motor_set_accel, send_data);
    }

    setVelocity (l_vel, r_vel) {
        var send_data = [];

        send_data.push((l_vel >> 8) & 0xFF);
        send_data.push((l_vel) & 0xFF);
        send_data.push((r_vel >> 8) & 0xFF);
        send_data.push((r_vel) & 0xFF);
        send_data.push(0x00);
        send_data.push(0x00);

        return this.send(BLEUUID.motor_service, BLEUUID.char_motor_set_speed, send_data);
    }

    setDistance (l_dist, r_dist) {
        var send_data = [];

        send_data.push((l_dist >> 8) & 0xFF);
        send_data.push((l_dist) & 0xFF);
        send_data.push((r_dist >> 8) & 0xFF);
        send_data.push((r_dist) & 0xFF);
        send_data.push((this._max_velocity >> 8) & 0xFF);
        send_data.push((this._max_velocity) & 0xFF);

        console.log(send_data);
        return this.send(BLEUUID.motor_service, BLEUUID.char_motor_set_distance, send_data);
    }

    setRotation (rotate_angle) {
        var send_data = [];

        send_data.push((rotate_angle >> 8) & 0xFF);
        send_data.push((rotate_angle) & 0xFF);
        send_data.push((this._max_velocity >> 8) & 0xFF);
        send_data.push((this._max_velocity) & 0xFF);

        console.log(send_data);

        return this.send(BLEUUID.motor_service, BLEUUID.char_motor_set_rotation, send_data);
    }

    send (service, characteristic, value) {
        if (!this.isConnected()) return;
        if (this._busy) return;

        this._busy = true;
        this._busyTimeoutID = window.setTimeout(() => {
            this._busy = false;
        }, 5000);

        const data = Base64Util.uint8ArrayToBase64(value);
        this._ble.write(service, characteristic, data, 'base64', false).then(
            () => {
                this._busy = false;
                window.clearTimeout(this._busyTimeoutID);
            }
        );
    }

    scan () {
        if (this._ble) {
            this._ble.disconnect();
        }
        this._ble = new BLE(this._runtime, this._extensionId, {
            filters: [
                {services: [BLEUUID.motor_service, BLEUUID.misc_service, BLEUUID.sensor_service]}
            ]
        }, this._onConnect, this.disconnect);
    }

    connect (id) {
        if (this._ble) {
            this._ble.connectPeripheral(id);
        }
    }

    disconnect () {
        window.clearInterval(this._timeoutID);
        if (this._ble) {
            this._ble.disconnect();
        }
    }

    isConnected () {
        let connected = false;
        if (this._ble) {
            connected = this._ble.isConnected();
        }
        return connected;
    }

    _onConnect () {
        this._ble.read(BLEUUID.sensor_service, BLEUUID.char_sensor_all_data, true, this._onMessage);
        this._timeoutID = window.setInterval(
            () => this._ble.handleDisconnectError(BLEDataStoppedError),
            BLETimeout
        );
    }

    _onMessage(base64) {
        const data = Base64Util.base64ToUint8Array(base64);

        this._robot_is_moving = data[0];
        this._battery.volt_level = data[1] / 10.0;
        this._battery.low_warning = data[2];
        this._user_button = data[3];

        this._floor_sensors.right_outer = data[4];
        this._floor_sensors.right_inner = data[5];
        this._floor_sensors.left_inner = data[6];
        this._floor_sensors.left_outer = data[7];

        this._distance_sensor.left = (data[9] << 8) + data[8];
        this._distance_sensor.right = (data[11] << 8) + data[10];

        imu_roll = ((data[13] << 8) + data[12]) & 0xFFFF;
        if(imu_roll & 0x8000) {
            imu_roll = imu_roll - 0x10000;
        }
        this._imu_sensors.imu_roll = imu_roll / 100.0;

        imu_pitch = ((data[15] << 8) + data[14]) & 0xFFFF;
        if(imu_pitch & 0x8000) {
            imu_pitch = imu_pitch - 0x10000;
        }
        this._imu_sensors.imu_pitch = imu_pitch / 100.0;

        imu_yaw = ((data[17] << 8) + data[16]) & 0xFFFF;
        if(imu_yaw & 0x8000) {
            imu_yaw = imu_yaw - 0x10000;
        }
        this._imu_sensors.imu_yaw = imu_yaw / 100.0;

        acc_x = ((data[19] << 8) + data[18]) & 0xFFFF;
        if(acc_x & 0x8000) {
            acc_x = acc_x - 0x10000;
        }
        this._imu_sensors.acc_x = acc_x / 100.0;

        acc_y = ((data[21] << 8) + data[20]) & 0xFFFF;
        if(acc_y & 0x8000) {
            acc_y = acc_y - 0x10000;
        }
        this._imu_sensors.acc_y = acc_y / 100.0;

        acc_z = ((data[23] << 8) + data[22]) & 0xFFFF;
        if(acc_z & 0x8000) {
            acc_z = acc_z - 0x10000;
        }
        this._imu_sensors.acc_z = acc_z / 100.0;

        gyro_x = ((data[25] << 8) + data[24]) & 0xFFFF;
        if(gyro_x & 0x8000) {
            gyro_x = gyro_x - 0x10000;
        }
        this._imu_sensors.gyro_x = gyro_x / 100.0;

        gyro_y = ((data[27] << 8) + data[26]) & 0xFFFF;
        if(gyro_y & 0x8000) {
            gyro_y = gyro_y - 0x10000;
        }
        this._imu_sensors.gyro_y = gyro_y / 100.0;

        gyro_z = ((data[29] << 8) + data[28]) & 0xFFFF;
        if(gyro_z & 0x8000) {
            gyro_z = gyro_z - 0x10000;
        }
        this._imu_sensors.gyro_z = gyro_z / 100.0;

        // cancel disconnect timeout and start a new one
        window.clearInterval(this._timeoutID);
        this._timeoutID = window.setInterval(
            () => this._ble.handleDisconnectError(BLEDataStoppedError),
            BLETimeout
        );
    }
}

const EdubotFloorSensorDirection = {
    LEFT_OUTER: 'left_outer',
    LEFT_INNER: 'left_inner',
    RIGHT_INNER: 'right_inner',
    RIGHT_OUTER: 'right_outer'
};

const EdubotDistanceSensorDirection = {
    LEFT: 'left',
    RIGHT: 'right'
};

const EdubotImuSensorImuAxis = {
    ROLL: 'roll',
    PITCH: 'pitch',
    YAW: 'yaw'
}

const EdubotImuSensorAxis = {
    X: 'x',
    Y: 'y',
    Z: 'z'
}

/**
 * Scratch 3.0 blocks to interact with a Edubot peripheral.
 */
class Scratch3EduBotBlocks {

    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return 'EduBot';
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return 'edubot';
    }

    /**
     * Construct a set of EduBot blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new EduBot peripheral instance
        this._peripheral = new EduBot(this.runtime, Scratch3EduBotBlocks.EXTENSION_ID);
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: Scratch3EduBotBlocks.EXTENSION_ID,
            name: Scratch3EduBotBlocks.EXTENSION_NAME,
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'getFloorSensors',
                    text: formatMessage({
                        id: 'edubot.getFloorSensors',
                        default: 'floor sensor [FLOOR_DIRECTION]',
                        description: 'the distance returned by the floor sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        FLOOR_DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'FLOOR_DIRECTION',
                            defaultValue: EdubotFloorSensorDirection.LEFT_INNER
                        }
                    }
                },
                {
                    opcode: 'getDistanceSensors',
                    text: formatMessage({
                        id: 'edubot.getDistanceSensors',
                        default: 'distance sensor [DISTANCE_DIRECTION]',
                        description: 'the distance returned by the distance sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DISTANCE_DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'DISTANCE_DIRECTION',
                            defaultValue: EdubotDistanceSensorDirection.LEFT
                        }
                    }
                },
                {
                    opcode: 'getImuSensors',
                    text: formatMessage({
                        id: 'edubot.getImuSensors',
                        default: 'imu sensor [IMU_AXIES]',
                        description: 'the imu returned by the imu sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        IMU_AXIES: {
                            type: ArgumentType.STRING,
                            menu: 'IMU_AXIES',
                            defaultValue: EdubotImuSensorImuAxis.ROLL
                        }
                    }
                },
                {
                    opcode: 'getAccSensors',
                    text: formatMessage({
                        id: 'edubot.getAccSensors',
                        default: 'accelerometer sensor [NORMAL_AXIES]',
                        description: 'the accelerometer returned by the imu sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NORMAL_AXIES: {
                            type: ArgumentType.STRING,
                            menu: 'NORMAL_AXIES',
                            defaultValue: EdubotImuSensorAxis.X
                        }
                    }
                },
                {
                    opcode: 'getGyroSensors',
                    text: formatMessage({
                        id: 'edubot.getGyroSensors',
                        default: 'gyro sensor [NORMAL_AXIES]',
                        description: 'the gyro returned by the imu sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NORMAL_AXIES: {
                            type: ArgumentType.STRING,
                            menu: 'NORMAL_AXIES',
                            defaultValue: EdubotImuSensorAxis.X
                        }
                    }
                },
                '---',
                {
                    opcode: 'whenButtonPressed',
                    text: formatMessage({
                        id: 'edubot.whenButtonPressed',
                        default: 'when button pressed',
                        description: 'when the button on the edubot is pressed'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                    }
                },
                {
                    opcode: 'isButtonPressed',
                    text: formatMessage({
                        id: 'edubot.isButtonPressed',
                        default: 'button pressed?',
                        description: 'is the button on the edubot pressed?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                    }
                },
                '---',
                {
                    opcode: 'getBatteryLevel',
                    text: formatMessage({
                        id: 'edubot.getBatteryLevel',
                        default: 'battery level',
                        description: 'the battery level on the edubot'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                    }
                },
                {
                    opcode: 'isBatteryLow',
                    text: formatMessage({
                        id: 'edubot.isBatteryLow',
                        default: 'needed charging?',
                        description: 'is the battery on the edubot needed charging?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                    }
                },
                '---',
                {
                    opcode: 'setText',
                    text: formatMessage({
                        id: 'edubot.setText',
                        default: 'set text [TEXT]',
                        description: 'display text on the edubot display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'edubot.defaultTextToDisplay',
                                default: 'Hello!',
                                description: `default text to display.`
                            })
                        }
                    }
                },
                {
                    opcode: 'setImage',
                    text: formatMessage({
                        id: 'edubot.setImage',
                        default: 'set display [INDEX]',
                        description: 'display text on the edubot display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'clearDisplay',
                    text: formatMessage({
                        id: 'edubot.clearDisplay',
                        default: 'clear display',
                        description: 'clear display on the edubot display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                    }
                },
                {
                    opcode: 'setLEDLamp',
                    text: formatMessage({
                        id: 'edubot.setLEDLamp',
                        default: 'set LED left [L_COLOR] right [R_COLOR]',
                        description: 'set LED on the edubot display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        L_COLOR: {
                            type: ArgumentType.COLOR,
                        },
                        R_COLOR: {
                            type: ArgumentType.COLOR,
                        }
                    }
                },
                {
                    opcode: 'turnOffLEDLamp',
                    text: formatMessage({
                        id: 'edubot.turnOffLEDLamp',
                        default: 'turn off LEDs',
                        description: 'turn off LEDs'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                    }
                },
                '---',
                {
                    opcode: 'isRobotMoving',
                    text: formatMessage({
                        id: 'edubot.isRobotMoving',
                        default: 'is robot moving?',
                        description: 'is the robot charging?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                    }
                },
                {
                    opcode: 'setMaxVel',
                    text: formatMessage({
                        id: 'edubot.setMaxVel',
                        default: 'set max. velocity to [MAX_VEL]',
                        description: 'set max velocity'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MAX_VEL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setAccel',
                    text: formatMessage({
                        id: 'edubot.setAccel',
                        default: 'set accelerlation to [ACCEL]',
                        description: 'set max acceleration'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ACCEL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setStep',
                    text: formatMessage({
                        id: 'edubot.setStep',
                        default: 'move by step left [L_STEP] and right [R_STEP]',
                        description: 'move by step'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        L_STEP: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        R_STEP: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setVelocity',
                    text: formatMessage({
                        id: 'edubot.setVelocity',
                        default: 'move by velocity left [L_VEL] and right [R_VEL]',
                        description: 'move by step'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        L_VEL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        R_VEL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setDistance',
                    text: formatMessage({
                        id: 'edubot.setDistance',
                        default: 'move by distance left [L_DIST] and right [R_DIST]',
                        description: 'move by step'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        L_DIST: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        R_DIST: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setRotation',
                    text: formatMessage({
                        id: 'edubot.setRotation',
                        default: 'rotate by angle [ROTATE_ANGLE]',
                        description: 'rotate by angle'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ROTATE_ANGLE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'moveForward',
                    text: formatMessage({
                        id: 'edubot.moveForward',
                        default: 'move forward',
                        description: 'move forward'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                    }
                },
                {
                    opcode: 'moveBackward',
                    text: formatMessage({
                        id: 'edubot.moveBackward',
                        default: 'move backward',
                        description: 'move backward'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                    }
                },
                {
                    opcode: 'stopMoving',
                    text: formatMessage({
                        id: 'edubot.stop',
                        default: 'stop',
                        description: 'stop'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                    }
                },
                {
                    opcode: 'turnLeft',
                    text: formatMessage({
                        id: 'edubot.turnLeft',
                        default: 'turn left',
                        description: 'turn left'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                    }
                },
                {
                    opcode: 'turnRight',
                    text: formatMessage({
                        id: 'edubot.turnRight',
                        default: 'turn right',
                        description: 'turn right'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                    }
                },

            ],
            menus: {
                FLOOR_DIRECTION: [
                    {
                        text: formatMessage({
                            id: 'edubot.floorSensorDirection.leftOuter',
                            default: 'left_outer',
                            description: 'label for left_outer element in floor_sensor direction menu for Edubot extension'
                        }),
                        value: EdubotFloorSensorDirection.LEFT_INNER
                    },
                    {
                        text: formatMessage({
                            id: 'edubot.floorSensorDirection.leftInner',
                            default: 'left_inner',
                            description: 'label for left_inner element in floor_sensor direction menu for Edubot extension'
                        }),
                        value: EdubotFloorSensorDirection.LEFT_OUTER
                    },
                    {
                        text: formatMessage({
                            id: 'edubot.floorSensorDirection.rightInner',
                            default: 'right_inner',
                            description: 'label for right_inner element in floor_sensor direction menu for Edubot extension'
                        }),
                        value: EdubotFloorSensorDirection.RIGHT_INNER
                    },
                    {
                        text: formatMessage({
                            id: 'edubot.floorSensorDirection.rightOuter',
                            default: 'right_outer',
                            description: 'label for right_outer element in floor_sensor direction menu for Edubot extension'
                        }),
                        value: EdubotFloorSensorDirection.RIGHT_OUTER
                    },
                ],
                DISTANCE_DIRECTION: [
                    {
                        text: formatMessage({
                            id: 'edubot.distanceSensorDirection.left',
                            default: 'left',
                            description: 'label for left element in distance_sensor direction menu for Edubot extension'
                        }),
                        value: EdubotDistanceSensorDirection.LEFT
                    },
                    {
                        text: formatMessage({
                            id: 'edubot.distanceSensorDirection.right',
                            default: 'right',
                            description: 'llabel for right element in distance_sensor direction menu for Edubot extension'
                        }),
                        value: EdubotDistanceSensorDirection.RIGHT
                    },
                ],
                IMU_AXIES: [
                    {
                        text: formatMessage({
                            id: 'edubot.imuSensorImuAxis.roll',
                            default: 'roll',
                            description: 'label for imu sensor imu axis element in imu menu for Edubot extension'
                        }),
                        value: EdubotImuSensorImuAxis.ROLL
                    },
                    {
                        text: formatMessage({
                            id: 'edubot.imuSensorImuAxis.pitch',
                            default: 'pitch',
                            description: 'label for imu sensor imu axis element in imu menu for Edubot extension'
                        }),
                        value: EdubotImuSensorImuAxis.PITCH
                    },
                    {
                        text: formatMessage({
                            id: 'edubot.imuSensorImuAxis.yaw',
                            default: 'yaw',
                            description: 'label for imu sensor imu axis element in imu menu for Edubot extension'
                        }),
                        value: EdubotImuSensorImuAxis.YAW
                    },
                ],
                NORMAL_AXIES: [
                    {
                        text: formatMessage({
                            id: 'edubot.imuSensorAxis.x',
                            default: 'x',
                            description: 'label for imu sensor imu axis element in imu menu for Edubot extension'
                        }),
                        value: EdubotImuSensorAxis.X
                    },
                    {
                        text: formatMessage({
                            id: 'eedubot.imuSensorAxis.y',
                            default: 'y',
                            description: 'label for imu sensor imu axis element in imu menu for Edubot extension'
                        }),
                        value: EdubotImuSensorAxis.Y
                    },
                    {
                        text: formatMessage({
                            id: 'edubot.imuSensorAxis.z',
                            default: 'z',
                            description: 'label for imu sensor imu axis element in imu menu for Edubot extension'
                        }),
                        value: EdubotImuSensorAxis.Z
                    },
                ],
            }
        };
    }

    getFloorSensors (args) {
        return this._getFloorSensors(args.FLOOR_DIRECTION);
    }

    _getFloorSensors (direction) {
        switch (direction) {
        case EdubotFloorSensorDirection.LEFT_OUTER:
            return this._peripheral.floorLeftOuter;
        case EdubotFloorSensorDirection.LEFT_INNER:
            return this._peripheral.floorLeftInner;
        case EdubotFloorSensorDirection.RIGHT_INNER:
            return this._peripheral.floorRightInner;
        case EdubotFloorSensorDirection.RIGHT_OUTER:
            return this._peripheral.floorRightOuter;
        }
    }

    getDistanceSensors (args) {
        return this._getDistanceSensors(args.DISTANCE_DIRECTION);
    }

    _getDistanceSensors (direction) {
        switch (direction) {
        case EdubotDistanceSensorDirection.LEFT:
            return this._peripheral.distanceLeft;
        case EdubotDistanceSensorDirection.RIGHT:
            return this._peripheral.distanceRight;
        }
    }

    getImuSensors (args) {
        return this._getImuSensors(args.IMU_AXIES);
    }

    _getImuSensors (axis) {
        switch (axis) {
        case EdubotImuSensorImuAxis.ROLL:
            return this._peripheral.imuRoll;
        case EdubotImuSensorImuAxis.PITCH:
            return this._peripheral.imuPitch;
        case EdubotImuSensorImuAxis.YAW:
            return this._peripheral.imuYaw;
        }
    }

    getAccSensors (args) {
        return this._getAccSensors(args.NORMAL_AXIES);
    }

    _getAccSensors (axis) {
        switch (axis) {
        case EdubotImuSensorAxis.X:
            return this._peripheral.accX;
        case EdubotImuSensorAxis.Y:
            return this._peripheral.accY;
        case EdubotImuSensorAxis.Z:
            return this._peripheral.accZ;
        }
    }

    getGyroSensors (args) {
        return this._getGyroSensors(args.NORMAL_AXIES);
    }

    _getGyroSensors (axis) {
        switch (axis) {
        case EdubotImuSensorAxis.X:
            return this._peripheral.gyroX;
        case EdubotImuSensorAxis.Y:
            return this._peripheral.gyroY;
        case EdubotImuSensorAxis.Z:
            return this._peripheral.gyroZ;
        }
    }

    whenButtonPressed (args) {
        return this._peripheral.userButton;
    }

    isButtonPressed (args) {
        return this._peripheral.userButton;
    }

    getBatteryLevel (args) {
        return this._peripheral.batteryLevel;
    }

    isBatteryLow (args) {
        return this._peripheral.checkLowWarning;
    }

    isRobotMoving (args) {
        return this._peripheral.isRobotMoving;
    }

    setText (args) {
        const text = String(args.TEXT).substring(0, 19);
        if (text.length > 0) {
            this._peripheral.setText(text);
        }

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 50);
        });
    }

    setImage (args) {
        const index = parseInt(args.INDEX);

        if (index >= 0 && index <= 3) {
            this._peripheral.setImage(index);
        }

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 50);
        });
    }

    clearDisplay (args) {
        this._peripheral.setText(" ");

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 50);
        });
    }

    setLEDLamp (args) {
        this._peripheral.setLEDLamp(args.L_COLOR, args.R_COLOR);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 50);
        });
    }

    turnOffLEDLamp (args) {
        this._peripheral.setLEDLamp('#000000', '#000000');

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 50);
        });
    }

    setStep (args) {
        const l_step = parseInt(args.L_STEP);
        const r_step = parseInt(args.R_STEP);

        this._peripheral.setStep(l_step, r_step);
    }

    setMaxVel (args) {
        const max_vel = parseInt(args.MAX_VEL);
        if(max_vel > 0 && max_vel <= 300) {
            this._peripheral.setMaxVel(max_vel);
        }
    }

    setAccel (args) {
        const accel = parseInt(args.ACCEL);
        if(accel >= 0 && accel < 3) {
            this._peripheral.setAccel(accel);
        }
    }

    setVelocity (args) {
        const l_vel = parseInt(args.L_VEL);
        const r_vel = parseInt(args.R_VEL);

        if(l_vel >= -300 && r_vel >= -300) {
            if(l_vel <= 300 && r_vel <= 300) {
                this._peripheral.setVelocity(l_vel, r_vel);
            }
        }
    }

    setDistance (args) {
        const l_dist = parseInt(args.L_DIST);
        const r_dist = parseInt(args.R_DIST);

        this._peripheral.setDistance(l_dist, r_dist);

        return new Promise(resolve => {
            var first_check = true;
            var ttt = setInterval(() => {
                if(this._peripheral.isRobotMoving == false && first_check == true) {
                    first_check = false;
                }
                else if(this._peripheral.isRobotMoving == false && first_check == false) {
                    resolve();
                    clearInterval(ttt);
                }
            }, 100);
        });
    }

    setRotation (args) {
        const rotate_angle = parseInt(args.ROTATE_ANGLE);
        this._peripheral.setRotation(rotate_angle);

        return new Promise(resolve => {
            var first_check = true;
            var ttt = setInterval(() => {
                if(this._peripheral.isRobotMoving == false && first_check == true) {
                    first_check = false;
                }
                else if(this._peripheral.isRobotMoving == false && first_check == false) {
                    resolve();
                    clearInterval(ttt);
                }
            }, 100);
        });
    }

    moveForward (args) {
        this._peripheral.setVelocity(this._peripheral._max_velocity, this._peripheral._max_velocity);
    }

    moveBackward (args) {
        this._peripheral.setVelocity(-1 * this._peripheral._max_velocity, -1 * this._peripheral._max_velocity);
    }

    stopMoving (args) {
        this._peripheral.setVelocity(0, 0);
    }

    turnLeft (args) {
        this._peripheral.setVelocity(-1 * this._peripheral._max_velocity, this._peripheral._max_velocity);
    }

    turnRight (args) {
        this._peripheral.setVelocity(this._peripheral._max_velocity, -1 * this._peripheral._max_velocity);
    }
}

module.exports = Scratch3EduBotBlocks;
