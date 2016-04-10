module Jekyll
  class MarkdownTweetConverter < Converter
    safe true
    priority :lowest

    def matches(ext)
      ext =~ /^\.md$/i
    end

    def output_ext(ext)
      ".html"
    end

    # Tweetの変換
    # 書式: [tweet: URL]
    def convert(content)
      content.gsub! /\[tweet:\s*(https:\/\/twitter\.com\/\w+\/status\/[[:digit:]]+)\]/ do
        "<blockquote class=\"twitter-tweet\" data-conversation=\"none\" lang=\"ja\" xml:lang=\"ja\"><a href=\"#{$1}\"></a></blockquote><script async defer src=\"//platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>"
      end

      content
    end
  end
end
