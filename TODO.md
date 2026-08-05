# TODO — ADR-004: Controller Layer Implementation

## Steps

- [x] 1. Create `DeviceController`
  - [x] `index(GetDevicesRequest)` → `DeviceServiceInterface::getAllDevices()`
  - [x] `show(string $deviceId)` → `DeviceServiceInterface::getDeviceByDeviceId()`
- [x] 2. Create `SensorDataController`
  - [x] `store(StoreSensorDataRequest, string $deviceId)` → `SensorDataServiceInterface::storeSensorData()` → 201
  - [x] `latest(GetLatestSensorDataRequest)` → `SensorDataServiceInterface::getLatestSensorData()`
  - [x] `history(GetSensorDataHistoryRequest)` → `SensorDataServiceInterface::getSensorDataHistory()` (Carbon parse)
- [x] 3. Create `AlertController`
  - [x] `index(GetAlertsRequest)` → `AlertServiceInterface::getAllAlerts()` (Carbon parse, optional)
  - [x] `show(int $id)` → `AlertServiceInterface::getAlertById()`
- [x] 4. Create `SystemStatusController`
  - [x] `show()` → `SystemStatusServiceInterface::getSystemStatus()`
- [x] 5. Review all Controllers
  - [x] API Specification compliance
  - [x] Service Layer compliance
  - [x] Form Request usage
  - [x] Clean Architecture / DI
  - [x] No business logic / DB queries / manual validation
  - [x] `php -l` on all Controllers
