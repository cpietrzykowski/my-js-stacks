<?php
  // my filter for casting query values to booleans
  // note: presence is truthy!
  //

  /**
   * my filter for casting query values to booleans
   * will be processed with filter_var
   * note: presence is truthy!
   *
   * @param  string         $key     key from $_GET
   * @param  boolean        $default default value unless valid
   * @return boolean                 value
   */
  function get_as_boolean($key, $default) {
    $rslt = $default;

    if (isset($_GET[$key])) {
      $v = $_GET[$key];
      $rslt = empty($v) ? true : \filter_var($v, FILTER_VALIDATE_BOOLEAN);
    }

    return $rslt;
  }

  $cache_file = './cache.json';
  $stack_file = './stack.json';
  $use_cache = get_as_boolean('cache', true);
  $update_cache = get_as_boolean('update', false);

  // default output
  $output = "{}";

  if ($use_cache) {
    // pull from cache in dev to speed up reloads
    $contents = @\file_get_contents($cache_file);
    if ($contents) {
      $output = $contents;
    }
  } else {
    $contents = \file_get_contents($stack_file);
    if ($contents) {
      // load package info from registry
      $json = \json_decode($contents, true);

      $base_url = $json['registry']['url'];
      $req = \curl_init();
      \curl_setopt_array($req, array(
        CURLOPT_RETURNTRANSFER => true
      ));
      foreach($json['packages'] as &$package) {
        $package_name = $package['name'];
        \curl_setopt($req, CURLOPT_URL, "{$base_url}{$package_name}");

        $response = \curl_exec($req);
        if($response !== false) {
          $details = [
            'description' => '',
            'homepage' => '',
            'latest' => '',
            'license' => '',
            'keywords' => []
          ];
          $respjson = \json_decode($response, true);

          foreach($details as $k => $v) {
            if (isset($respjson[$k])) {
              $details[$k] = $respjson[$k];
            }
          }

          $disttags = $respjson['dist-tags'];
          $details['latest'] = $disttags['latest'];
          $package['details'] = $details;
        } else {
          $package['details'] = \curl_error($req);
        }
      }
      \curl_close($req);

      $json['last-updated'] = \date("c");

      // sort the given collections by their 'name' property
      $keys_to_sort = ['managers', 'packages', 'types'];
      foreach($keys_to_sort as $k) {
        \usort($json[$k], function($l, $r) {
          return strcoll(\strtolower($l['name']), \strtolower($r['name']));
        });
      }

      $output = \json_encode($json, JSON_UNESCAPED_SLASHES);

      // update cache for dev
      if ($update_cache) {
        \file_put_contents($cache_file, $output);
      }
    }
  }

  // output json data
  header('Content-type: application/json');
  echo($output);
?>
