<?php
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

  /**
   * SCRIPT CONFIG
   */
  $cache_file = './cache.json';
  $stack_file = './stack.json';
  $use_cache = get_as_boolean('cache', true);
  $update_cache = get_as_boolean('update', false);

  // shallow package object template/schema
  $package_template = [
    'name' => '',
    'type' => 'common',
    'dependencies'=> [],
    'development' => true,
    'notes' => '',
    'details' => [],
    'config' => []
  ];

  // default output
  $output = '{}';

  if ($use_cache) {
    // pull from cache in dev to speed up reloads
    // hopefully npm will allow cors eventually for clients to get their
    // own package info
    $contents = \file_get_contents($cache_file);
    if ($contents) {
      $output = $contents;
    }
  } else {
    $contents = \file_get_contents($stack_file);
    if ($contents) {
      // load package info from local defs
      $json = \json_decode($contents, true);

      $base_url = $json['registry']['url'];

      // setup curl
      $req = \curl_init();
      \curl_setopt_array($req, array(
        CURLOPT_RETURNTRANSFER => true
      ));

      foreach ($json['packages'] as &$package) {
        $package_name = $package['name'];
        
        // assign empty fields to default
        foreach ($package_template as $k => $v) {
          if (!isset($package[$k])) {
            $package[$k] = $package_template[$k];
          }
        }

        // retrieve this package's info from the npm registry
        $registry_url = "{$base_url}{$package_name}";
        \curl_setopt($req, CURLOPT_URL, $registry_url);
        $response = \curl_exec($req);
        $package['details'] = [
          'description' => '',
          'homepage' => '',
          'keywords' => [],
          'license' => '',
          'src' => $registry_url
        ];

        if ($response !== false) {
          $npmjson = \json_decode($response, true);

          // assign only certain keys (don't need the entire version history,
          // for example)
          foreach ($package['details'] as $k => $v) {
            if (isset($npmjson[$k])) {
              $package['details'][$k] = $npmjson[$k];
            }
          }

          // grab the latest version of this package
          $package['details']['latest'] = $npmjson['dist-tags']['latest'];
          \ksort($package, SORT_LOCALE_STRING);
        } else {
          $package['details']['error'] = \curl_error($req);
        }

        // sort the package node by template key order
        $pkg_keys = \array_keys($package_template);
        \uksort($package, function($l, $r) use ($pkg_keys) {
          $ixl = \array_search($l, $pkg_keys);
          $ixr = \array_search($r, $pkg_keys);

          if ($ixl && $ixr) {
            return $ixl - $ixr;
          } elseif ($ixl) {
            return 1;
          } else {
            return (-1);
          }

          return 0;
        });
      }
      \curl_close($req);

      $json['last-updated'] = \date("c");

      // sort the given detail collections by their 'name' property
      $keys_to_sort = ['managers', 'packages', 'types'];
      foreach ($keys_to_sort as $k) {
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
