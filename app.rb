require "sinatra"
require "json"
require "redcarpet"
require "dotenv/load"
require_relative "../ruby_chromatic_agent/agent"

MARKDOWN = Redcarpet::Markdown.new(
  Redcarpet::Render::HTML.new(link_attributes: { target: "_blank", rel: "noopener noreferrer" }),
  autolink: true,
  tables: true,
  fenced_code_blocks: true,
  strikethrough: true,
  no_intra_emphasis: true
)

$agent = ChromaticAgent.new

set :public_folder, File.join(__dir__, "public")
set :views, File.join(__dir__, "views")

get "/" do
  erb :index
end

post "/chat" do
  content_type :json

  body = JSON.parse(request.body.read)
  message = body["message"].to_s.strip
  halt 400, { error: "Message cannot be empty." }.to_json if message.empty?

  response = MARKDOWN.render($agent.chat(message))
  { response: response, summary: SESSION.summary }.to_json
rescue => e
  status 500
  { error: e.message }.to_json
end

post "/reset" do
  content_type :json
  $agent = ChromaticAgent.new
  SESSION.reset!
  { ok: true }.to_json
end
