require 'net/http'

module AddGeojsonFeatures
    class Generator < ::Jekyll::Generator
        def generate(site)
            site.data["regions"].each do |region|
                next unless region['geo_json']

                file = File.open(Dir.pwd() + region['geo_json'])
                region["feature"] = file.read
            end
        end
    end
end