package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

// example:
// https://api.instagram.com/v1/media/1036147723200923772_2258617\?access_token\=2258617.c9ba29c.2abbf48756174e90a5a2bb3225a8155d

var BASE_URL = "https://api.instagram.com/v1/media/"
var ACCESS_TOKEN = ""

type meta struct {
	Code int `json:"code"`
}
type location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Name      string  `json:"loc_name"`
}
type imageItem struct {
	Url    string `json:"url"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}
type user struct {
	UserName       string `json:"username"`
	ProfilePicture string `json:"profile_picture"`
	Id             string `json:"id"`
	FullName       string `json:"full_name"`
}
type caption struct {
	Text    string `json:"text"`
	Created string `json:"created_time"`
	Id      string `json:"id"`
	From    user   `json:"from"`
}
type itemData struct {
	Location location             `json:"location"`
	Link     string               `json:"link"`
	Filter   string               `json:"filter"`
	Caption  caption              `json:"caption"`
	Images   map[string]imageItem `json:"images"`
	Id       string               `json:"id"`
}

type media_item struct {
	Meta     meta     `json:"meta"`
	ItemData itemData `json:"data"`
}

// assumption is there is a file called instagram_access_token and it contains nothing but the toekn, not even a line feed at the end
func getAccessTokenFromFile() (string, error) {
	content, err := ioutil.ReadFile("instagram_access_token")
	if err != nil {
		return "", err
	}
	sc := string(content)
	token := strings.Split(sc, "\n")[0]
	return token, nil
}

func callApi(id, access_token string) (media_item, error) {
	var err error
	item := media_item{}

	client := &http.Client{}
	url := BASE_URL + id + "?access_token=" + access_token
	//fmt.Println(url)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return item, err
	}
	contenttype := "application/json"
	req.Header.Add("Content-Type", contenttype)
	resp, err := client.Do(req)
	if err != nil {
		return item, err
	}
	rbb, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return item, err
	}
	err = json.Unmarshal(rbb, &item)

	if err != nil {
		fmt.Printf("Response: %#v\n", string(rbb))
	}
	return item, err
}

func genHTML(item media_item) string {
	output := ""
	//id := item.ItemData.Id
	link := item.ItemData.Link
	src := item.ItemData.Images["standard_resolution"].Url
	image_w := item.ItemData.Images["standard_resolution"].Width
	//image_h := item.ItemData.Images["standard_resolution"].Height
	location := item.ItemData.Location
	//filter := item.ItemData.Filter
	caption := item.ItemData.Caption
	// created         = Time.at(Integer(item.created_time"])).strftime("%I:%M%p %B %e, %Y")
	title := caption.Text

	output = fmt.Sprintf("<p><a href='%s'><img src='%s' alt='%s' /></a>", link, src, title)

	if location.Latitude != 0 {
		output += fmt.Sprintf("<p><a href='http://maps.google.com?q=%f,%f'>", location.Latitude, location.Longitude)

		output += "<img border='0' "
		output += fmt.Sprintf("src='http://maps.googleapis.com/maps/api/staticmap?center=%f,%f&markers=%f,%f&zoom=14&size=%dx200&sensor=false' ", location.Latitude, location.Longitude, location.Latitude, location.Longitude, image_w)
		output += "alt='#{loc_alt}' /></a>"
	}
	if location.Name != "" {
		output += fmt.Sprintf("<br/>Taken at %s", location.Name)
	}
	output += "</p>"

	return output
}

//func genPost(title, html string) string {
//	post := ""
//	post += `---`
//	post += `layout: post`
//	post += `title:` + title
//	post += `modified:`
//	post += `categories: posts`
//	post += `excerpt: Just an instagram post, a friend of mine drew this on our office wall.`
//	post += `tags: [photo, instagram, DC, startup, culture]`
//	post += `image:`
//	post += `  feature:`
//	post += `date: 2015-08-14T08:00:45-04:00`
//	post += `---`
//	post += html
//
//	return post
//}

// the idea here is to create the post the normal way then >> append the out put of this to the post
func main() {
	// parse the args and get the id
	// example item id "1036147723200923772_2258617"
	var itemid = flag.String("itemid", "", "The media id you can get by adding user id to the image id or by calling this api: ")
	//var title = flag.String("title", "", "the post title, it defaults to the caption of the instagram pic, if left empty")
	flag.Parse()

	// read access token from file
	accessToken, err := getAccessTokenFromFile()
	//fmt.Printf("\n%#v\n", accessToken)
	if err != nil {
		panic(err)
	}

	// call api get the info
	item, err := callApi(*itemid, accessToken)
	if err != nil {
		panic(err)
	}
	//if *title == "" {
	//	title = *item.ItemData.Caption.Text
	//}

	// write the info to out file or stdout
	html := genHTML(item)
	fmt.Println(html)
	//	post := genPost(title, html)
	//	fmt.Printf("Post: \n%s\n", post)
}
