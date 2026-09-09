Pod::Spec.new do |s|
  s.name = 'ApplePlaceSearch'
  s.version = '1.0.0'
  s.summary = 'Itinova Apple Maps place search'
  s.description = s.summary
  s.license = { :type => 'MIT' }
  s.author = 'Itinova'
  s.homepage = 'https://developer.apple.com/maps/'
  s.source = { :git => 'https://github.com/expo/expo.git' }
  s.platforms = { :ios => '16.4' }
  s.static_framework = true
  s.source_files = '**/*.swift'
  s.swift_version = '5.9'
  s.frameworks = 'MapKit'
  s.dependency 'ExpoModulesCore'
end
