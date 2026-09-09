import ExpoModulesCore
import MapKit

public class ApplePlaceSearchModule: Module {
  private var searches: [String: MKLocalSearch] = [:]

  public func definition() -> ModuleDefinition {
    Name("ApplePlaceSearch")

    AsyncFunction("search") { (query: String, citiesOnly: Bool, lat: Double?, lng: Double?, requestId: String, promise: Promise) in
      let request = MKLocalSearch.Request()
      request.naturalLanguageQuery = query
      request.resultTypes = citiesOnly ? .address : [.pointOfInterest, .address]
      if citiesOnly, #available(iOS 18.0, *) {
        // 광역시·도쿄처럼 광역 행정구역으로 분류된 여행지도 포함한다.
        request.addressFilter = MKAddressFilter(including: [.locality, .administrativeArea])
      }
      if let lat, let lng {
        request.region = MKCoordinateRegion(
          center: CLLocationCoordinate2D(latitude: lat, longitude: lng),
          latitudinalMeters: 50000, longitudinalMeters: 50000)
      }
      let search = MKLocalSearch(request: request)
      self.searches[requestId] = search
      search.start { response, error in
        self.searches.removeValue(forKey: requestId)
        if let error {
          if (error as NSError).domain == MKErrorDomain && (error as NSError).code == MKError.placemarkNotFound.rawValue {
            promise.resolve([] as [[String: Any]])
          } else {
            promise.reject("ERR_PLACE_SEARCH", "장소를 검색하지 못했어요.")
          }
          return
        }
        let results: [[String: Any]] = (response?.mapItems ?? []).compactMap { item in
          let p = item.placemark
          guard let name = item.name, !name.isEmpty else { return nil }
          if citiesOnly && p.locality == nil && p.administrativeArea == nil { return nil }
          let coord = p.coordinate
          guard CLLocationCoordinate2DIsValid(coord) else { return nil }
          var key = "\(name)|\(coord.latitude)|\(coord.longitude)"
          if #available(iOS 18.0, *), let identifier = item.identifier {
            key = identifier.rawValue
          }
          let country = p.isoCountryCode ?? ""
          let currency = country.isEmpty ? "KRW" : (Locale(identifier: "en_\(country)").currency?.identifier ?? "KRW")
          return [
            "applePlaceId": key, "name": name,
            "address": p.title ?? name,
            "region": [p.locality, p.administrativeArea, p.country].compactMap { $0 }.joined(separator: " · "),
            "countryCode": country, "currency": currency,
            "lat": coord.latitude, "lng": coord.longitude,
            "poiCategory": item.pointOfInterestCategory?.rawValue ?? ""
          ]
        }
        promise.resolve(results)
      }
    }.runOnQueue(.main)

    AsyncFunction("cancel") { (requestId: String) in
      self.searches.removeValue(forKey: requestId)?.cancel()
    }.runOnQueue(.main)
  }
}
