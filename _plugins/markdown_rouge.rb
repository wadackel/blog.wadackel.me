require "rouge"
require "cgi"

module Jekyll
  class MarkdownRougeConverter < Converter
    safe false
    priority :low

    def matches(ext)
      ext =~ /^\.md$/i
    end

    def output_ext(ext)
      ".html"
    end

    def convert(content)
      # ソースコードのファイル名指定
      # 書式:
      #     ```js:filename.js
      #     console.log("Hello World");
      #     ```
      #
      content.gsub! /<pre><code class="language-(.+?):(.+?)">(.*?)<\/code><\/pre>/m do
        lang = $1
        filename = $2
        code = Rouge.highlight($3, lang, "html")
        code.gsub! "<pre class=\"highlight\">", "<pre class=\"highlight\"><span class=\"highlight__filename\">#{filename}</span>"
        code.gsub! "<code>", "<code class=\"language-#{lang}\">"
        "<div class=\"highlighter-rouge\">#{code}</div>"
      end

      # コピー用HTMLの追加
      num = 0
      content.gsub! "<pre class=\"highlight\">" do
        num += 1
        "<pre id=\"highlight-#{num}\" class=\"highlight\"><span class=\"highlight__copy\" data-clipboard-target=\"#highlight-#{num}\"><span class=\"highlight__copy__msg\">Copied</span></span>"
      end

      content
    end
  end
end
